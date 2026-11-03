import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { uploadHealthDocument } from "../middlewares/uploadMiddleware.js";
import {
    createDocument,
    listMyDocuments,
    listDeletedDocuments,
    listShareableDoctors,
    listActivity,
    deleteDocument,
    restoreDocument,
    listSharedWithMe,
    getDocumentFile
} from "../controllers/healthDocumentController.js";

const router = express.Router();

// Patient
router.post("/", protect, authorizeRoles("patient"), uploadHealthDocument, createDocument);
router.get("/my", protect, authorizeRoles("patient"), listMyDocuments);
router.get("/my/deleted", protect, authorizeRoles("patient"), listDeletedDocuments);
router.get("/doctors", protect, authorizeRoles("patient"), listShareableDoctors);
router.get("/activity", protect, authorizeRoles("patient"), listActivity);
router.delete("/:id", protect, authorizeRoles("patient"), deleteDocument);
router.post("/:id/restore", protect, authorizeRoles("patient"), restoreDocument);

// Doctor
router.get("/shared-with-me", protect, authorizeRoles("doctor"), listSharedWithMe);

// Patient (owner) or the one doctor it was shared with
router.get("/:id/file", protect, getDocumentFile);

export default router;
