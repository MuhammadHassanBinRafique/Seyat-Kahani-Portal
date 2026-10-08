import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  doctorDeleteAppointment,
  undoDoctorDeleteAppointment
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("patient"), bookAppointment);
router.get("/my", protect, getMyAppointments);
router.delete("/:id/doctor-delete", protect, authorizeRoles("doctor"), doctorDeleteAppointment);
router.post("/:id/undo-delete", protect, authorizeRoles("doctor"), undoDoctorDeleteAppointment);
router.get("/:id", protect, getAppointmentById);
router.patch("/:id/status", protect, authorizeRoles("doctor"), updateAppointmentStatus);
router.delete("/:id", protect, authorizeRoles("patient"), cancelAppointment);

export default router;