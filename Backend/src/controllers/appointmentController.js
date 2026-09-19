import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import User from "../models/user.model.js";

// --- Small reusable validators (security: input validation) ---
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);
const isValidTime = (time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

// ================= BOOK APPOINTMENT (patient only) =================
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    // --- NoSQL injection guard: reject anything that isn't a plain string ---
    if (
      typeof doctorId !== "string" ||
      typeof date !== "string" ||
      typeof time !== "string" ||
      typeof reason !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // --- Input validation ---
    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor id" });
    }
    if (!isValidDate(date)) {
      return res.status(400).json({ message: "Date must be in YYYY-MM-DD format" });
    }
    if (!isValidTime(time)) {
      return res.status(400).json({ message: "Time must be in HH:MM (24-hour) format" });
    }
    if (reason.trim().length === 0) {
      return res.status(400).json({ message: "Reason is required" });
    }

    // Confirm the doctorId actually belongs to a real user with role "doctor"
    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Prevent booking a slot in the past
    const requestedDateTime = new Date(`${date}T${time}`);
    if (requestedDateTime < new Date()) {
      return res.status(400).json({ message: "Cannot book an appointment in the past" });
    }

    // --- Conflict check: block double-booking the same doctor/date/time ---
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $in: ["pending", "confirmed"] }
    });
    if (conflict) {
      return res.status(409).json({ message: "This time slot is already booked" });
    }

    const appointment = new Appointment({
      patient: req.user.id,   // taken from the verified JWT, never trusted from req.body
      doctor: doctorId,
      date,
      time,
      reason
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment booked successfully", appointment });

  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET MY APPOINTMENTS (patient or doctor) =================
export const getMyAppointments = async (req, res) => {
  try {
    const { id, role } = req.user;

    // Query differs depending on who's asking — a patient sees their own bookings,
    // a doctor sees appointments booked with them.
    const filter = role === "doctor" ? { doctor: id } : { patient: id };

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ date: 1, time: 1 });

    res.status(200).json(appointments);

  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UPDATE STATUS (doctor only, their own appointments) =================
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid appointment id" });
    }

    if (typeof status !== "string") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const allowedStatuses = ["confirmed", "cancelled", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // --- Ownership check: a doctor can only update appointments booked with them ---
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied: not your appointment" });
    }

    // --- Basic status transition rule: no changes once cancelled/completed ---
    if (["cancelled", "completed"].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot change status of a ${appointment.status} appointment` });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ message: "Appointment status updated", appointment });

  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= CANCEL APPOINTMENT (patient only, their own, if still pending) =================
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid appointment id" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // --- Ownership check: a patient can only cancel their own appointment ---
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied: not your appointment" });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be cancelled this way" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled successfully" });

  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET SINGLE APPOINTMENT (patient or doctor, only if it's theirs) =================
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid appointment id" });
    }

    const appointment = await Appointment.findById(id)
      .populate("patient", "name email")
      .populate("doctor", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ownership check: only the patient or doctor involved can view it — not just anyone logged in
    const isOwner =
      appointment.patient._id.toString() === req.user.id ||
      appointment.doctor._id.toString() === req.user.id;

    if (!isOwner) {
      return res.status(403).json({ message: "Access denied: not your appointment" });
    }

    res.status(200).json(appointment);

  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};