import User from "../models/user.model.js";
import JWT from "jsonwebtoken";
import { verifyGoogleIdToken } from "../utils/googleAuth.js";

const issueToken = (user) => JWT.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "10d" }
);

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

// ================= GOOGLE LOGIN / SIGNUP (one endpoint for both) =================
export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (typeof idToken !== "string" || !idToken) {
            return res.status(400).json({ message: "Invalid input" });
        }

        let payload;
        try {
            payload = await verifyGoogleIdToken(idToken);
        } catch (err) {
            // Forged, expired, or issued for a different app — never trust it.
            return res.status(401).json({ message: "Invalid Google token" });
        }

        if (!payload?.email || !payload?.sub) {
            return res.status(400).json({ message: "Google account did not return an email" });
        }

        const email = payload.email.toLowerCase();

        // 1) Someone who has signed in with this exact Google identity before.
        let user = await User.findOne({ googleId: payload.sub });

        if (!user) {
            // 2) A local account already exists with this same email address.
            const existingByEmail = await User.findOne({ email });

            if (existingByEmail) {
                // Only auto-link if Google itself has verified this email. Without this
                // check, someone could register an unverified Google account on a
                // victim's email address and silently take over their existing account.
                if (!payload.email_verified) {
                    return res.status(403).json({ message: "This Google account's email is not verified" });
                }
                existingByEmail.googleId = payload.sub;
                if (!existingByEmail.isEmailVerified) existingByEmail.isEmailVerified = true;
                await existingByEmail.save();
                user = existingByEmail;
            } else {
                // 3) Brand new person. Role always defaults to patient — same rule as
                // normal signup; nobody can become a doctor/admin through self-service
                // signup, social or otherwise.
                user = await User.create({
                    name: payload.name || email.split("@")[0],
                    email,
                    authProvider: "google",
                    googleId: payload.sub,
                    isEmailVerified: !!payload.email_verified
                });
            }
        }

        const token = issueToken(user);

        res.status(200).json({
            message: "Login Sucessfully!",
            token,
            user: toSafeUser(user)
        });

    } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
