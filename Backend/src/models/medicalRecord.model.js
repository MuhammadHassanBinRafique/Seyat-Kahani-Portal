import mongoose from "mongoose";

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
    diagnosis: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: ""
    },
    prescription: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ""
    }
}, { timestamps: true });

export default mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", medicalRecordSchema);
