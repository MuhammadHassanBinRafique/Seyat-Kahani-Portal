import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("patient"), bookAppointment);
router.get("/my", protect, getMyAppointments);
router.get("/:id", protect, getAppointmentById);
router.patch("/:id/status", protect, authorizeRoles("doctor"), updateAppointmentStatus);
router.delete("/:id", protect, authorizeRoles("patient"), cancelAppointment);

export default router;