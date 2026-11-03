import express from "express";
const Router = express.Router();
import { signup, login, logout } from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";
import { verifyEmail, resendVerification, forgotPassword, resetPassword } from "../controllers/emailAuthController.js";
import { protect } from "../middlewares/authMiddleware.js";


Router.post("/signup", signup);
Router.post("/login", login);
Router.post("/google", googleLogin);
Router.post("/verify-email", verifyEmail);
Router.post("/resend-verification", resendVerification);
Router.post("/forgot-password", forgotPassword);
Router.post("/reset-password", resetPassword);
Router.post("/logout", protect, logout);

export default Router;