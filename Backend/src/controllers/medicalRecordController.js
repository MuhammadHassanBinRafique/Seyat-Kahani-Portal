import mongoose from "mongoose";
import MedicalRecord from "../models/medicalRecord.model.js";
import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ================= CREATE RECORD (doctor only) =================
export const createRecord = async (req, res) => {
    try {
        const { patientId, appointmentId, diagnosis, notes, prescription } = req.body;

        // --- NoSQL injection guard ---
        if (
            typeof patientId !== "string" ||
            typeof diagnosis !== "string" ||
            (notes !== undefined && typeof notes !== "string") ||
            (prescription !== undefined && typeof prescription !== "string") ||
            (appointmentId !== undefined && appointmentId !== null && typeof appointmentId !== "string")
        ) {
            return res.status(400).json({ message: "Invalid input" });
        }

        // --- Input validation ---
        if (!isValidObjectId(patientId)) {
            return res.status(400).json({ message: "Invalid patient id" });
        }
        if (diagnosis.trim().length === 0) {
            return res.status(400).json({ message: "Diagnosis is required" });
        }

        // Confirm the patientId actually belongs to a real user with role "patient"
        const patient = await User.findOne({ _id: patientId, role: "patient" });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // --- Relationship check: a doctor can only write a record for a patient
        // they've actually had an appointment with. A cancelled-only history doesn't
        // count — at least one pending/confirmed/completed appointment must exist.
        const hasRelationship = await Appointment.findOne({
            doctor: req.user.id,
            patient: patientId,
            status: { $in: ["pending", "confirmed", "completed"] },
            deletedAt: null
        });
        if (!hasRelationship) {
            return res.status(403).json({ message: "You can only create records for patients you have an appointment with" });
        }

        // appointmentId is optional, but if given it must be real and must actually
        // belong to this same patient + doctor pair — otherwise a doctor could link
        // a record to someone else's appointment.
        let appointmentRef = null;
        if (appointmentId) {
            if (!isValidObjectId(appointmentId)) {
                return res.status(400).json({ message: "Invalid appointment id" });
            }
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: "Appointment not found" });
            }
            if (
                appointment.patient.toString() !== patientId ||
                appointment.doctor.toString() !== req.user.id
            ) {
                return res.status(403).json({ message: "This appointment does not belong to you and this patient" });
            }
            appointmentRef = appointmentId;
        }

        const record = new MedicalRecord({
            patient: patientId,
            doctor: req.user.id,   // taken from the verified JWT, never from the request body
            appointment: appointmentRef,
            diagnosis: diagnosis.trim(),
            notes: (notes || "").trim(),
            prescription: (prescription || "").trim()
        });

        await record.save();
        res.status(201).json({ message: "Medical record created successfully", record });

    } catch (error) {
        console.error("Create medical record error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ================= GET MY RECORDS (patient or doctor) =================
export const getMyRecords = async (req, res) => {
    try {
        const { id, role } = req.user;

        // A patient sees records written about them; a doctor sees records they wrote.
        const filter = role === "doctor" ? { doctor: id } : { patient: id };

        const records = await MedicalRecord.find(filter)
            .populate("patient", "name email")
            .populate("doctor", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(records);

    } catch (error) {
        console.error("Get medical records error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ================= GET SINGLE RECORD (patient or doctor, only if it's theirs) =================
export const getRecordById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid record id" });
        }

        const record = await MedicalRecord.findById(id)
            .populate("patient", "name email")
            .populate("doctor", "name email");

        if (!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        // --- Ownership check: only the patient or doctor involved can view it ---
        const isOwner =
            record.patient._id.toString() === req.user.id ||
            record.doctor._id.toString() === req.user.id;

        if (!isOwner) {
            return res.status(403).json({ message: "Access denied: not your medical record" });
        }

        res.status(200).json(record);

    } catch (error) {
        console.error("Get medical record error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
