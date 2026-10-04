import mongoose from "mongoose";

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
    }

},{timestamps: true});

export default mongoose.model("User", userSchema);