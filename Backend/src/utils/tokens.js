import crypto from "crypto";

// One-time email tokens (verify email / reset password).
// The raw token only ever goes into the email link. The database keeps its SHA-256 hash,
// so someone who reads the database cannot use the stored values to take over accounts.
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const createToken = () => {
  const token = crypto.randomBytes(32).toString("hex"); // 64 hex characters
  return { token, hash: hashToken(token) };
};

// Cheap shape check before touching the database.
export const isTokenShape = (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
