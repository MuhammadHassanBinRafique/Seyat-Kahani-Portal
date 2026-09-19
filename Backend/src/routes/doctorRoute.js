import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/user.model.js";

const router = express.Router();

// Any logged-in user (patient or doctor) can see the list of doctors —
// needed so patients know who they're booking with.
router.get("/", protect, async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;