import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { verifyGoogleIdToken } from "../utils/googleAuth.js";

// Key name here is "emailVerified" (not the model's "isEmailVerified") to match
// the field name the frontend profile card already reads.
const toSafeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider,
    emailVerified: user.isEmailVerified,
    hasPassword: !!user.password
});

// ================= GET MY PROFILE =================
// Lets the frontend refresh its picture of the logged-in user (e.g. after setting
// a password for the first time) without forcing a full re-login.
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user: toSafeUser(user) });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

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
            user: toSafeUser(updatedUser)
        });

    } catch (error) {
        console.error("Update name error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ================= CHANGE PASSWORD (also handles "set password" for Google accounts) =================
// One endpoint, two behaviors, chosen by what's actually true about the account —
// not by which URL the frontend happened to call:
//   - Account already has a password (local account, or a Google account that set
//     one previously): currentPassword is required and checked, same as before.
//   - Account has no password yet (a pure Google account): there is nothing to
//     verify against, so this becomes "add a password", turning the account into
//     a hybrid that can log in either way from now on.
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (typeof newPassword !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }
        if (currentPassword !== undefined && typeof currentPassword !== "string") {
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

        const hadPasswordBefore = !!user.password;

        if (hadPasswordBefore) {
            // --- Require the current password before allowing a change ---
            // Without this, anyone with access to an already-logged-in session (e.g. an
            // unlocked laptop, or a stolen token) could silently take over the account
            // forever by setting a new password without knowing the old one.
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required" });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            const isSameAsOld = await bcrypt.compare(newPassword, user.password);
            if (isSameAsOld) {
                return res.status(400).json({ message: "New password must be different from the current password" });
            }
        }
        // else: no password exists yet — first-time set, nothing to verify against.

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({
            message: hadPasswordBefore ? "Password updated successfully" : "Password set successfully",
            user: toSafeUser(user)
        });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ================= DELETE ACCOUNT =================
// Deleting an account is destructive and permanent, so every path must prove
// "this is really the account owner, right now" before it happens — the proof
// just looks different depending on how the account can actually authenticate.
export const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password) {
            // Has a real password (local account, or a Google account that later set
            // one) — re-enter it, same as before.
            const { password } = req.body;
            if (typeof password !== "string") {
                return res.status(400).json({ message: "Invalid input" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Password is incorrect" });
            }
        } else {
            // Pure Google account — there is no password to check, so the only
            // equivalent proof is signing in with Google again, right now, and
            // confirming it's the same Google identity as this account's.
            const { idToken } = req.body;
            if (typeof idToken !== "string" || !idToken) {
                return res.status(400).json({ message: "Google re-authentication is required to delete this account" });
            }
            let payload;
            try {
                payload = await verifyGoogleIdToken(idToken);
            } catch (err) {
                return res.status(401).json({ message: "Invalid Google token" });
            }
            if (payload.sub !== user.googleId) {
                return res.status(403).json({ message: "This Google account does not match your account" });
            }
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
