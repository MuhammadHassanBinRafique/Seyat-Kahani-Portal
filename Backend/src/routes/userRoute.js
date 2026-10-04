import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getMe, updateName, changePassword, deleteAccount } from "../controllers/userController.js";

const router = express.Router();

// All routes here act only on the logged-in user's own account (req.user.id from the JWT) —
// no :id param exists, so there's no way to target anyone else's account through these routes.
router.get("/me", protect, getMe);
router.patch("/me", protect, updateName);
router.patch("/me/password", protect, changePassword);
router.delete("/me", protect, deleteAccount);

export default router;
