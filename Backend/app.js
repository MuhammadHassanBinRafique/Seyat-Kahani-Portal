import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoute from "./src/routes/authRoute.js";
import adminRoute from "./src/routes/adminRoute.js";

const app = express();

// Sets standard security-related HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet());

// Restrict CORS to only your actual live frontend + local dev, instead of allowing every origin.
// Add any other real frontend URLs (e.g. a staging URL) to this array as needed.
const allowedOrigins = [
  "https://seyat-kahani-portal.vercel.app",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman/Thunder Client, or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));

app.use(express.json());

// Rate limiting on auth routes specifically — blocks brute-force login/signup attempts.
// Allows 20 requests per 15 minutes per IP on /api/auth/*.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req, res) =>{
     res.send("API is working Smoothly!!!");
});

app.use("/api/auth", authLimiter, authRoute);
app.use("/api/admin", adminRoute);

export default app;