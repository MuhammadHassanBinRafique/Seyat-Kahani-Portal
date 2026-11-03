import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { createToken, hashToken, isTokenShape } from "../utils/tokens.js";
import { sendMail } from "../utils/mailer.js";
import { verificationEmail, passwordResetEmail } from "../utils/emailTemplates.js";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // verification link: 24 hours
const RESET_TTL_MS = 60 * 60 * 1000;       // reset link: 1 hour (it is the key to the account)
const COOLDOWN_MS = 60 * 1000;             // at most one email per minute per account

// Same answer whether or not the email belongs to an account, so these routes cannot be used
// to find out who is registered (same rule the signup route already follows).
const RESEND_RESPONSE = "If that email belongs to an account that still needs verification, a new link has been sent.";
const FORGOT_RESPONSE = "If an account exists for that email, a password reset link has been sent.";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const onCooldown = (sentAt) => !!sentAt && Date.now() - sentAt.getTime() < COOLDOWN_MS;

// Links point at the FRONTEND (it is deployed separately from this API).
const frontendUrl = () => (process.env.FRONTEND_URL || "http://localhost:5000").replace(/\/+$/, "");

// Used by signup and by "resend". Throws if the mail could not be sent; callers decide what to do.
export const sendVerificationEmail = async (user) => {
  const { token, hash } = createToken();
  user.emailVerificationToken = hash;
  user.emailVerificationExpires = new Date(Date.now() + VERIFY_TTL_MS);
  user.emailVerificationSentAt = new Date();
  await user.save();

  const mail = verificationEmail({ name: user.name, link: `${frontendUrl()}/verify-email?token=${token}` });
  await sendMail({ to: user.email, ...mail });
};

// ================= VERIFY EMAIL (opened from the link in the email) =================
// POST (not GET) so mail scanners that pre-open links cannot use the token up.
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!isTokenShape(token)) {
      return res.status(400).json({ message: "This verification link is invalid or has expired.", code: "INVALID_TOKEN" });
    }

    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
      deletedAt: null
    });
    if (!user) {
      return res.status(400).json({ message: "This verification link is invalid or has expired.", code: "INVALID_TOKEN" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;   // single use
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Your email has been verified. You can now log in." });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= RESEND VERIFICATION EMAIL (public: the person may not be able to log in yet) =================
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (typeof email !== "string" || !isValidEmail(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase(), deletedAt: null });
    if (user && user.role === "patient" && !user.isEmailVerified && !onCooldown(user.emailVerificationSentAt)) {
      try {
        await sendVerificationEmail(user);
      } catch (error) {
        console.error("Resend verification email error:", error);
      }
    }

    res.status(200).json({ message: RESEND_RESPONSE });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (typeof email !== "string" || !isValidEmail(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase(), deletedAt: null });
    if (user && !onCooldown(user.passwordResetSentAt)) {
      try {
        const { token, hash } = createToken();
        user.passwordResetToken = hash;
        user.passwordResetExpires = new Date(Date.now() + RESET_TTL_MS);
        user.passwordResetSentAt = new Date();
        await user.save();

        const mail = passwordResetEmail({ name: user.name, link: `${frontendUrl()}/reset-password?token=${token}` });
        await sendMail({ to: user.email, ...mail });
      } catch (error) {
        console.error("Forgot password email error:", error);
      }
    }

    res.status(200).json({ message: FORGOT_RESPONSE });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= RESET PASSWORD (from the link in the email) =================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!isTokenShape(token) || typeof password !== "string") {
      return res.status(400).json({ message: "This reset link is invalid or has expired.", code: "INVALID_TOKEN" });
    }
    // 8 matches the login form's own minimum; 72 is bcrypt's real limit (longer input is silently cut).
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    if (password.length > 72) {
      return res.status(400).json({ message: "Password must be 72 characters or fewer" });
    }

    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
      deletedAt: null
    });
    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired.", code: "INVALID_TOKEN" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;       // single use
    user.passwordResetExpires = undefined;
    user.passwordResetSentAt = undefined;
    user.isEmailVerified = true;               // they just proved they control this mailbox
    user.tokenVersion = (user.tokenVersion || 0) + 1; // signs out every session using the old password
    await user.save();

    res.status(200).json({ message: "Your password has been updated. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
