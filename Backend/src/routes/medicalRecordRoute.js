import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { createRecord, getMyRecords, getRecordById, deleteRecord } from "../controllers/medicalRecordController.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("doctor"), createRecord);
router.get("/my", protect, getMyRecords);
router.get("/:id", protect, getRecordById);
router.delete("/:id", protect, authorizeRoles("doctor"), deleteRecord);

export default router;
