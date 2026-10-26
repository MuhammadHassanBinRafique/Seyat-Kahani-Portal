import mongoose from "mongoose";
import { encryptField, decryptField } from "../utils/fieldCrypto.js";

const medicalRecordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        default: null
    },
    // diagnosis, notes and prescription are encrypted before they reach the database and
    // decrypted when read. Length limits are checked on the plain text in the controller
    // (a maxlength here would be measured against the longer ciphertext).
    diagnosis: {
        type: String,
        required: true,
        trim: true,
        set: encryptField,
        get: decryptField
    },
    notes: {
        type: String,
        trim: true,
        default: "",
        set: encryptField,
        get: decryptField
    },
    prescription: {
        type: String,
        trim: true,
        default: "",
        set: encryptField,
        get: decryptField
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true, toJSON: { getters: true, virtuals: false }, toObject: { getters: true, virtuals: false } });

export default mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", medicalRecordSchema);
