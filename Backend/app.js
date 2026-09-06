import express from "express";
import cors from "cors";
import authRoute from "./src/routes/authRoute.js";
import adminRoute from "./src/routes/adminRoute.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) =>{
     res.send("API is working Smoothly!!!");
});

app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);

export default app;