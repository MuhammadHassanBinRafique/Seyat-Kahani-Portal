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
        required: true
    },

    googleId: {
        type: String,
        unique: true,
        sparse: true
    },

    role: {
       type: String,
        enum: ["doctor" , "patient"],
        default: "patient"
    }

},{timestamps: true});

export default mongoose.model("User", userSchema);