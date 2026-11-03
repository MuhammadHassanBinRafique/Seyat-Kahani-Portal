import mongoose from "mongoose";

export const HEALTH_CATEGORIES = ["lab", "prescription", "imaging", "vaccination"];

// One PDF uploaded by a patient into their Health Vault.
// The file itself lives in a PRIVATE Vercel Blob store; only its pathname is kept here and
// it is never sent to the client — the file is streamed through an authenticated route.
const healthDocumentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        enum: HEALTH_CATEGORIES,
        required: true
    },
    // The ONE doctor this file is shared with (null = only the patient). Set at upload time from
    // doctors the patient has an appointment with; only that doctor can open/download it.
    sharedWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    originalName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },
    blobPath: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

healthDocumentSchema.index({ patient: 1, deletedAt: 1, createdAt: -1 });
healthDocumentSchema.index({ sharedWith: 1, deletedAt: 1, createdAt: -1 });

export default mongoose.models.HealthDocument || mongoose.model("HealthDocument", healthDocumentSchema);
