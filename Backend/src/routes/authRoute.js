import express from "express";
const Router = express.Router();
import { signup, login, logout } from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";
import { protect } from "../middlewares/authMiddleware.js";


Router.post("/signup", signup);
Router.post("/login", login);
Router.post("/google", googleLogin);
Router.post("/logout", protect, logout);

export default Router;