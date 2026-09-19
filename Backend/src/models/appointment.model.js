import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: String,        // stored as "YYYY-MM-DD"
    required: true
  },
  time: {
    type: String,        // stored as "HH:MM" (24-hour)
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending"
  }
}, { timestamps: true });

// Prevents the exact same doctor from being double-booked at the exact same date+time.
appointmentSchema.index({ doctor: 1, date: 1, time: 1 });

export default mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);