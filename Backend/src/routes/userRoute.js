import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { getMe, updateName, changePassword, deleteAccount, setProfilePicture, removeProfilePicture, getHealthProfile, updateHealthProfile } from "../controllers/userController.js";
import { uploadProfilePicture } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// All routes here act only on the logged-in user's own account (req.user.id from the JWT) —
// no :id param exists, so there's no way to target anyone else's account through these routes.
router.get("/me", protect, getMe);
router.patch("/me", protect, updateName);
router.patch("/me/password", protect, changePassword);
router.delete("/me", protect, authorizeRoles("patient"), deleteAccount);
router.patch("/me/picture", protect, uploadProfilePicture, setProfilePicture);
router.delete("/me/picture", protect, removeProfilePicture);
router.get("/me/health-profile", protect, authorizeRoles("patient"), getHealthProfile);
router.patch("/me/health-profile", protect, authorizeRoles("patient"), updateHealthProfile);

export default router;
