import express from "express";
const Router = express.Router();
import { signup, login, googleConfig, googleSignup } from "../controllers/authController.js";


Router.post("/signup", signup);
Router.post("/login", login);
Router.get("/google-config", googleConfig);
Router.post("/google", googleSignup);

export default Router;