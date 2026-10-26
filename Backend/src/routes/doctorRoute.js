import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import User from "../models/user.model.js";

const router = express.Router();

// Patients need the directory for booking; doctors do not need access to it.
router.get("/", protect, authorizeRoles("patient"), async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("_id name");
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;