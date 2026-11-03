import express from "express";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";
import authRoute from "./src/routes/authRoute.js";
import adminRoute from "./src/routes/adminRoute.js";
import appointmentRoute from "./src/routes/appointmentRoute.js";
import doctorRoute from "./src/routes/doctorRoute.js";
import userRoute from "./src/routes/userRoute.js";
import medicalRecordRoute from "./src/routes/medicalRecordRoute.js";
import healthDocumentRoute from "./src/routes/healthDocumentRoute.js";
import patientRoute from "./src/routes/patientRoute.js";
import path from "path";
import { fileURLToPath } from "url";
import pageRoute from "./src/routes/pageRoute.js";
import AppError from "./src/utils/AppError.js";
import { requestContext, notFound, errorHandler } from "./src/middlewares/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set("trust proxy", 1);

// Request id for log/response correlation (see middlewares/errorHandler.js)
app.use(requestContext);

// Sets standard security-related HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
// same-origin-allow-popups lets the Google sign-in popup send the login back to this page.
app.use(helmet({ contentSecurityPolicy: false, crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" } }));

// Restrict CORS to only your actual live frontend + local dev, instead of allowing every origin.
// Add any other real frontend URLs (e.g. a staging URL) to this array as needed.
const allowedOrigins = [
  "https://seyat-kahani-portal.vercel.app",
  "http://localhost:5000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:51337",
  "http://localhost:52865",
  // Optional extra origins (comma-separated), e.g. staging/preview URLs, without a code change
  ...(process.env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean)
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman/Thunder Client, or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError("Origin not allowed", 403, "CORS_ORIGIN_NOT_ALLOWED"));
    }
  },
}));

app.use(express.json());

// maxRetriesPerRequest keeps a Redis outage from hanging requests; the limiters below fail open
// (passOnStoreError) so the site keeps working, just without rate limiting, while Redis is down.
const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, connectTimeout: 3000 })
  : null;

if (redisClient) {
  redisClient.on("error", (error) => console.error("Redis error:", error.message));
}

// express-rate-limit refuses to let two limiters share one store, so each limiter gets its own.
const makeStore = (prefix) => {
  if (!redisClient) return undefined;
  const store = new RedisStore({ prefix, sendCommand: (...args) => redisClient.call(...args) });
  // RedisStore preloads its Lua scripts in the constructor; if Redis is down that promise
  // rejects with nobody listening, which would crash the process.
  store.incrementScriptSha?.catch(() => {});
  store.getScriptSha?.catch(() => {});
  return store;
};

if (!redisClient) {
  console.warn("REDIS_URL is not configured; using in-memory rate limiting for this instance.");
}

// Rate limiting on auth routes specifically — blocks brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  store: makeStore("rl:auth:"),
  passOnStoreError: true,
  message: { message: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  store: makeStore("rl:login-email:"),
  passOnStoreError: true,
  skipSuccessfulRequests: true, // only failed attempts use up the budget
  keyGenerator: (req) => {
    const email = typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
    return email ? `login-email:${email}` : `login-ip:${req.ip}`;
  },
  message: { message: "Too many login attempts for this account, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware for clean frontend URls like /login, /Doctor=dashboard.
app.use("/", pageRoute);
app.use("/Frontend", express.static(path.join(__dirname, "../Frontend"), { index: false }));
app.use("/assests", express.static(path.join(__dirname, "../assests")));

// Serverless: index.js never runs on Vercel, so connect on the first request
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 0) await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});


app.use("/api/auth", authLimiter);
app.use("/api/auth/login", loginEmailLimiter);
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/appointments", appointmentRoute);
app.use("/api/doctors", doctorRoute);
app.use("/api/users", userRoute);
app.use("/api/medical-records", medicalRecordRoute);
app.use("/api/health-documents", healthDocumentRoute);
app.use("/api/patients", patientRoute);

// Keep these two LAST: unknown /api routes -> JSON 404, then the global error handler.
app.use("/api", notFound);
app.use(errorHandler);

export default app;