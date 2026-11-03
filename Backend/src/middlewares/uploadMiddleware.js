import multer from "multer";
import AppError from "../utils/AppError.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// memoryStorage: Vercel's disk is read-only/temporary, so the file is kept in RAM
// just long enough to forward it to Vercel Blob (see userController.uploadProfilePicture).
// 2 MB cap keeps us well under Vercel's 4.5 MB request-body limit.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new AppError("Only JPG, PNG or WEBP images are allowed", 400, "INVALID_FILE_TYPE"));
    }
    cb(null, true);
  },
});

// Field name the frontend must use in FormData: "picture"
export const uploadProfilePicture = upload.single("picture");

// Health Vault PDFs. Field name the frontend must use in FormData: "document".
// 4 MB cap: Vercel rejects request bodies above 4.5 MB before our code even runs.
// The file's real content is re-checked in the controller (mimetype alone can be faked).
const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new AppError("Only PDF files are allowed", 400, "INVALID_FILE_TYPE"));
    }
    cb(null, true);
  },
});

export const uploadHealthDocument = pdfUpload.single("document");
