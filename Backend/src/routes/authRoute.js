import express from "express";
const Router = express.Router();
import { signup, login } from "../controllers/authController.js";


Router.post("/signup", signup);
Router.post("/login", login);

export default Router;