import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { getMyPatients } from "../controllers/patientController.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("doctor"), getMyPatients);

export default router;
