import express from "express";
import cors from "cors";
import authRoute from "../Backend/src/routes/authRoute.js";
import adminRoute from "../Backend/src/routes/adminRoute.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) =>{
     res.send("API is working Smoothly!!!");
});

app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);

export default app;