import crypto from "crypto";
import { STATUS_CODES } from "http";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

// Gives every request an id (also returned as X-Request-Id) so a user-reported
// error can be matched to the exact server log line.
export const requestContext = (req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
};

// Unknown /api/* routes get a JSON 404 instead of Express's default HTML page.
export const notFound = (req, res, next) => {
  next(new AppError("Route not found", 404, "NOT_FOUND"));
};

// Turns any thrown/forwarded error into { status, message, code }.
// 5xx messages are always generic so internals never leak to the client.
const normalizeError = (err) => {
  if (err instanceof AppError) {
    return { status: err.statusCode, message: err.message, code: err.code };
  }
  if (err?.type === "entity.parse.failed") {
    return { status: 400, message: "Invalid JSON in request body", code: "INVALID_JSON" };
  }
  if (err?.type === "entity.too.large") {
    return { status: 413, message: "Request body is too large", code: "PAYLOAD_TOO_LARGE" };
  }
  if (err?.name === "ValidationError" || err?.name === "CastError") {
    return { status: 400, message: "Invalid input", code: "INVALID_INPUT" };
  }
  if (err?.code === 11000) {
    return { status: 409, message: "Duplicate value", code: "DUPLICATE" };
  }
  if (err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError") {
    return { status: 401, message: "Invalid or expired token", code: "INVALID_TOKEN" };
  }
  const status = err?.status || err?.statusCode;
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return { status, message: STATUS_CODES[status] || "Bad Request", code: "CLIENT_ERROR" };
  }
  return { status: 500, message: "Server Error", code: "INTERNAL_ERROR" };
};

// Must be registered LAST in app.js (4 arguments = Express error middleware).
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // If the response already started we cannot send JSON; let Express close it.
  if (res.headersSent) return next(err);

  const { status, message, code } = normalizeError(err);

  const meta = {
    requestId: req.id,
    method: req.method,
    path: req.path, // path only: query strings can contain tokens
    status,
    code,
    errorName: err?.name,
    errorMessage: err?.message,
  };
  if (status >= 500) {
    if (process.env.NODE_ENV !== "production") meta.stack = err?.stack;
    logger.error("Request failed", meta);
  } else {
    logger.warn("Request rejected", meta);
  }

  res.status(status).json({ message, code, requestId: req.id });
};
