import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    action: {
        type: String,
        enum: ["create", "view", "delete"],
        required: true
    },
    recordType: {
        type: String,
        required: true
    },
    recordId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
