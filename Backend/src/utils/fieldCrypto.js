import crypto from "crypto";

// Field-level encryption for sensitive medical text (AES-256-GCM).
// Stored format: enc:v1:<iv>:<auth tag>:<ciphertext>  (each part base64url).
// The "v1" marker leaves room to rotate keys/algorithms later.
const PREFIX = "enc:v1:";

// MEDICAL_DATA_KEY = 32 random bytes, as base64 or 64 hex characters.
// Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
const getKey = () => {
  const raw = (process.env.MEDICAL_DATA_KEY || "").trim();
  const key = raw ? Buffer.from(raw, /^[0-9a-fA-F]{64}$/.test(raw) ? "hex" : "base64") : null;
  if (!key || key.length !== 32) {
    throw new Error("MEDICAL_DATA_KEY is missing or is not 32 bytes (base64 or 64 hex characters)");
  }
  return key;
};

export const isEncrypted = (value) => typeof value === "string" && value.startsWith(PREFIX);

// Empty strings stay empty (notes/prescription are optional).
// Anything else is ALWAYS encrypted, even if it happens to start with "enc:v1:",
// so a user can't store a fake ciphertext that later breaks reads.
export const encryptField = (value) => {
  if (typeof value !== "string" || value === "") return value;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return PREFIX + [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(":");
};

// Values without the prefix are older plaintext records and are returned as they are
// until the migrate script encrypts them. A wrong key or tampered data throws.
export const decryptField = (value) => {
  if (!isEncrypted(value)) return value;
  const [iv, tag, encrypted] = value.slice(PREFIX.length).split(":").map((part) => Buffer.from(part, "base64url"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
};
