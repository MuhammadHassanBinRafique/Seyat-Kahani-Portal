import crypto from "node:crypto";
import path from "node:path";
import { Readable } from "node:stream";
import mongoose from "mongoose";
import { put, get, del } from "@vercel/blob";
import HealthDocument, { HEALTH_CATEGORIES } from "../models/healthDocument.model.js";
import AuditLog from "../models/auditLog.model.js";
import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import AppError from "../utils/AppError.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// A deleted document stays recoverable for this long, then it is removed for good.
const TRASH_DAYS = 30;
const trashCutoff = () => new Date(Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000);

// Health Vault files go to a separate PRIVATE store, so it has its own token
// (the profile pictures use BLOB_READ_WRITE_TOKEN from the public store).
const privateToken = () => {
    const token = process.env.PRIVATE_BLOB_READ_WRITE_TOKEN;
    if (!token) throw new AppError("File storage is not configured", 500, "STORAGE_NOT_CONFIGURED");
    return token;
};

// blobPath is deliberately left out: clients only ever get the document id.
const toSafeDocument = (doc) => ({
    id: doc._id,
    category: doc.category,
    originalName: doc.originalName,
    size: doc.size,
    createdAt: doc.createdAt,
    deletedAt: doc.deletedAt || null,
    sharedWith: doc.sharedWith?.name ? { id: doc.sharedWith._id, name: doc.sharedWith.name } : null,
    patient: doc.patient?.name ? { id: doc.patient._id, name: doc.patient.name } : null
});

// Doctors a patient may share a file with: only those with a non-cancelled appointment.
const getShareableDoctors = async (patientId) => {
    const doctorIds = await Appointment.distinct("doctor", {
        patient: patientId,
        status: { $in: ["pending", "confirmed", "completed"] },
        deletedAt: null
    });
    if (!doctorIds.length) return [];
    return User.find({ _id: { $in: doctorIds }, role: "doctor", deletedAt: null }).select("_id name");
};

// There is no cron job on Vercel, so expired trash is cleaned up whenever its owner opens the vault.
const purgeExpired = async (patientId) => {
    try {
        const token = privateToken();
        const expired = await HealthDocument.find({ patient: patientId, deletedAt: { $lt: trashCutoff() } });
        for (const doc of expired) {
            await del(doc.blobPath, { token }).catch(() => {});
            await doc.deleteOne();
        }
    } catch (error) {
        // Cleanup is best-effort; it must never break listing.
    }
};

// ================= UPLOAD (patient only) =================
export const createDocument = async (req, res, next) => {
    let uploadedPath = null;
    try {
        if (!req.file) {
            return next(new AppError("Please choose a PDF file", 400, "NO_FILE"));
        }

        const { category, doctorId } = req.body;
        if (typeof category !== "string" || !HEALTH_CATEGORIES.includes(category)) {
            return next(new AppError("Invalid category", 400, "INVALID_CATEGORY"));
        }

        // Every PDF starts with "%PDF-"; a renamed .exe or .html claiming to be a PDF does not.
        if (req.file.buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
            return next(new AppError("This file is not a valid PDF", 400, "INVALID_FILE_TYPE"));
        }

        // Optional: share with exactly one doctor the patient has an appointment with.
        let sharedWith = null;
        if (doctorId !== undefined && doctorId !== "") {
            if (typeof doctorId !== "string" || !isValidObjectId(doctorId)) {
                return next(new AppError("Invalid doctor", 400, "INVALID_ID"));
            }
            const doctors = await getShareableDoctors(req.user.id);
            if (!doctors.some((doctor) => doctor._id.toString() === doctorId)) {
                return next(new AppError("You can only share with a doctor you have an appointment with", 403, "FORBIDDEN"));
            }
            sharedWith = doctorId;
        }

        // multer reads the filename as latin1; convert to utf8, then keep only a plain display name.
        const originalName = path
            .basename(Buffer.from(req.file.originalname, "latin1").toString("utf8"))
            .replace(/[\u0000-\u001f\u007f]/g, "")
            .slice(0, 150) || "document.pdf";

        // Path comes from the JWT user id + a random id, never from the client's filename.
        const blob = await put(
            `health-vault/${req.user.id}/${crypto.randomUUID()}.pdf`,
            req.file.buffer,
            { access: "private", contentType: "application/pdf", token: privateToken() }
        );
        uploadedPath = blob.pathname;

        const doc = await HealthDocument.create({
            patient: req.user.id,
            category,
            sharedWith,
            originalName,
            blobPath: blob.pathname,
            size: req.file.size
        });
        await doc.populate("sharedWith", "name");

        await AuditLog.create({
            actor: req.user.id,
            action: "create",
            recordType: "HealthDocument",
            recordId: doc._id
        });

        res.status(201).json({ message: "Document uploaded", document: toSafeDocument(doc) });
    } catch (error) {
        // Don't leave an orphan file in the store if saving the record failed.
        if (uploadedPath) await del(uploadedPath, { token: process.env.PRIVATE_BLOB_READ_WRITE_TOKEN }).catch(() => {});
        next(error);
    }
};

// ================= LIST MY DOCUMENTS (patient) =================
export const listMyDocuments = async (req, res, next) => {
    try {
        await purgeExpired(req.user.id);
        const docs = await HealthDocument.find({ patient: req.user.id, deletedAt: null })
            .sort({ createdAt: -1 })
            .populate("sharedWith", "name");
        res.status(200).json(docs.map(toSafeDocument));
    } catch (error) {
        next(error);
    }
};

// ================= LIST MY RECENTLY DELETED DOCUMENTS (patient) =================
export const listDeletedDocuments = async (req, res, next) => {
    try {
        const docs = await HealthDocument.find({ patient: req.user.id, deletedAt: { $gte: trashCutoff() } })
            .sort({ deletedAt: -1 });
        res.status(200).json(docs.map((doc) => ({
            ...toSafeDocument(doc),
            daysLeft: Math.max(0, Math.ceil(TRASH_DAYS - (Date.now() - doc.deletedAt.getTime()) / 86400000))
        })));
    } catch (error) {
        next(error);
    }
};

// ================= DOCTORS I CAN SHARE WITH (patient) =================
export const listShareableDoctors = async (req, res, next) => {
    try {
        const doctors = await getShareableDoctors(req.user.id);
        res.status(200).json(doctors.map((doctor) => ({ id: doctor._id, name: doctor.name })));
    } catch (error) {
        next(error);
    }
};

// ================= VAULT ACTIVITY (patient): who did what to MY documents =================
export const listActivity = async (req, res, next) => {
    try {
        const docs = await HealthDocument.find({ patient: req.user.id }).select("_id originalName");
        const names = new Map(docs.map((doc) => [doc._id.toString(), doc.originalName]));

        const logs = await AuditLog.find({ recordType: "HealthDocument", recordId: { $in: [...names.keys()] } })
            .sort({ createdAt: -1 })
            .limit(15)
            .populate("actor", "name role");

        res.status(200).json(logs.map((log) => ({
            id: log._id,
            action: log.action,
            entity: names.get(log.recordId.toString()) || "Document",
            actorName: log.actor?.name || "Unknown",
            actorRole: log.actor?.role || null,
            byMe: log.actor?._id.toString() === req.user.id,
            createdAt: log.createdAt
        })));
    } catch (error) {
        next(error);
    }
};

// ================= DELETE = move to trash (patient owner only) =================
export const deleteDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return next(new AppError("Invalid document id", 400, "INVALID_ID"));
        }

        const doc = await HealthDocument.findOne({ _id: id, patient: req.user.id, deletedAt: null });
        if (!doc) {
            return next(new AppError("Document not found", 404, "NOT_FOUND"));
        }

        doc.deletedAt = new Date();
        await doc.save();
        await AuditLog.create({ actor: req.user.id, action: "delete", recordType: "HealthDocument", recordId: doc._id });

        res.status(200).json({ message: "Document moved to trash" });
    } catch (error) {
        next(error);
    }
};

// ================= UNDO DELETE (patient owner only, within the trash period) =================
export const restoreDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return next(new AppError("Invalid document id", 400, "INVALID_ID"));
        }

        const doc = await HealthDocument.findOne({ _id: id, patient: req.user.id, deletedAt: { $gte: trashCutoff() } });
        if (!doc) {
            return next(new AppError("Document not found", 404, "NOT_FOUND"));
        }

        doc.deletedAt = null;
        await doc.save();
        await AuditLog.create({ actor: req.user.id, action: "restore", recordType: "HealthDocument", recordId: doc._id });

        res.status(200).json({ message: "Document restored" });
    } catch (error) {
        next(error);
    }
};

// ================= DOCUMENTS SHARED WITH ME (doctor) =================
export const listSharedWithMe = async (req, res, next) => {
    try {
        const docs = await HealthDocument.find({ sharedWith: req.user.id, deletedAt: null })
            .sort({ createdAt: -1 })
            .populate("patient", "name");
        res.status(200).json(docs.filter((doc) => doc.patient).map(toSafeDocument));
    } catch (error) {
        next(error);
    }
};

// ================= OPEN / DOWNLOAD ONE PDF =================
// Allowed: the patient who owns it, or the single doctor it was shared with (while it is not deleted).
// Everyone else gets 403. Add ?download=1 to get it as a download instead of opening in the browser.
export const getDocumentFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return next(new AppError("Invalid document id", 400, "INVALID_ID"));
        }

        const doc = await HealthDocument.findById(id);
        if (!doc) {
            return next(new AppError("Document not found", 404, "NOT_FOUND"));
        }

        const isOwner = doc.patient.toString() === req.user.id;
        const isSharedDoctor =
            req.user.role === "doctor" &&
            !doc.deletedAt &&
            !!doc.sharedWith &&
            doc.sharedWith.toString() === req.user.id;
        if (!isOwner && !isSharedDoctor) {
            return next(new AppError("Access denied: not your document", 403, "FORBIDDEN"));
        }

        const file = await get(doc.blobPath, { access: "private", token: privateToken() });
        if (!file || file.statusCode !== 200) {
            return next(new AppError("Document file not found", 404, "NOT_FOUND"));
        }

        await AuditLog.create({ actor: req.user.id, action: "view", recordType: "HealthDocument", recordId: doc._id });

        const disposition = req.query.download === "1" ? "attachment" : "inline";
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `${disposition}; filename*=UTF-8''${encodeURIComponent(doc.originalName)}`);
        res.setHeader("Cache-Control", "private, no-store");

        Readable.fromWeb(file.stream)
            .on("error", (error) => (res.headersSent ? res.destroy(error) : next(error)))
            .pipe(res);
    } catch (error) {
        next(error);
    }
};
