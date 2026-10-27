// An error we raise on purpose, with the HTTP status the client should see.
// Anything that is NOT an AppError is treated as an unexpected bug (HTTP 500).
export default class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}
