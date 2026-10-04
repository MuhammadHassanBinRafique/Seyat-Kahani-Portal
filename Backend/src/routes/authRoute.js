import express from "express";
const Router = express.Router();
import { signup, login } from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";


Router.post("/signup", signup);
Router.post("/login", login);
Router.post("/google", googleLogin);

export default Router;