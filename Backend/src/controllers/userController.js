import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// ================= UPDATE NAME (rename) =================
export const updateName = async (req, res) => {
    try {
        const { name } = req.body;

        // --- NoSQL injection guard + input validation ---
        if (typeof name !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const trimmedName = name.trim();
        if (trimmedName.length === 0 || trimmedName.length > 100) {
            return res.status(400).json({ message: "Name must be between 1 and 100 characters" });
        }

        // req.user.id comes from the verified JWT, never from the request body —
        // so a user can only ever rename their own account, never someone else's.
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name: trimmedName },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Name updated successfully",
            user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role }
        });

    } catch (error) {
        console.error("Update name error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // --- NoSQL injection guard ---
        if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }

        // Need the password field here — normal queries exclude it via .select("-password")
        // in other controllers, but this one specifically needs it to verify the current password.
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // --- Require the current password before allowing a change ---
        // Without this, anyone with access to an already-logged-in session (e.g. an
        // unlocked laptop, or a stolen token) could silently take over the account
        // forever by setting a new password without knowing the old one.
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOld) {
            return res.status(400).json({ message: "New password must be different from the current password" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ================= DELETE ACCOUNT =================
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        // --- NoSQL injection guard ---
        if (typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // --- Require password re-entry before deleting ---
        // Same reasoning as password change: prevents an unattended logged-in
        // session from being used to permanently destroy the account.
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect" });
        }

        await User.findByIdAndDelete(req.user.id);

        // Note: this does not delete or reassign the user's existing appointments.
        // Any appointment referencing this user will simply show a missing/empty
        // patient or doctor field when populated. Decide later whether to cascade-delete
        // those appointments or keep them as historical records — not handled here.

        res.status(200).json({ message: "Account deleted successfully" });

    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
