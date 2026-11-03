import mongoose from "mongoose";
import { encryptField, decryptField } from "../utils/fieldCrypto.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
       type: String,
        // Only local accounts sign up with a password. A Google account has none
        // until the user explicitly chooses to set one later (see changePassword).
        required: function () { return this.authProvider === "local"; }
    },

    role: {
       type: String,
        enum: ["doctor" , "patient"],
        default: "patient"
    },

    tokenVersion: {
        type: Number,
        default: 0
    },

    deletedAt: {
        type: Date,
        default: null
    },

    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },

    // Google's own stable user id ("sub" claim). Unique + sparse so local accounts
    // (which have no googleId at all) don't collide with each other on this field.
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },

    // Local accounts prove their email by whatever process you add later.
    // Google accounts are marked verified immediately, because Google already
    // verified that email before ever handing it to this app.
    isEmailVerified: {
        type: Boolean,
        default: false
    },

    // Profile photo lives in Vercel Blob; we keep its public URL (for <img src>)
    // and its pathname (so the old file can be deleted when the photo is replaced).
    profilePicture: {
        type: String,
        default: null
    },

    // One-time email tokens. Only the SHA-256 hash is stored (the raw token lives only in the
    // email link) and select:false keeps the hashes out of normal queries.
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    emailVerificationSentAt: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordResetSentAt: { type: Date },

    // Health profile shown in the Health Vault. Allergies / conditions are free text kept
    // encrypted like medical records (comma separated); blood type is a plain enum.
    bloodType: {
        type: String,
        enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        default: ""
    },
    allergies: {
        type: String,
        default: "",
        set: encryptField,
        get: decryptField
    },
    chronicConditions: {
        type: String,
        default: "",
        set: encryptField,
        get: decryptField
    },
    profilePicturePath: {
        type: String,
        default: null
    }

},{timestamps: true});

export default mongoose.model("User", userSchema);