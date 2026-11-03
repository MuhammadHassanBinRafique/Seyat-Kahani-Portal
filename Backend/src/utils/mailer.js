import nodemailer from "nodemailer";

// Provider-neutral: any SMTP service works (Brevo, Resend SMTP, Amazon SES, Gmail app password...).
// Switching provider only means changing the SMTP_* values in .env.
let transporter; // undefined = not created yet, null = SMTP not configured

const getTransporter = () => {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) {
    transporter = null;
    return transporter;
  }

  const port = Number(SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: String(SMTP_SECURE).toLowerCase() === "true" || port === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    // Don't let a slow mail server hold the request until the serverless time limit.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
  return transporter;
};

export const sendMail = async ({ to, subject, text, html }) => {
  const mailTransport = getTransporter();

  if (!mailTransport) {
    // No SMTP configured: fine on a developer machine (the email is printed in the terminal
    // so the flow can be tested), but never silently pretend in production.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email is not configured: SMTP_HOST is missing");
    }
    console.log(`\n[DEV EMAIL - SMTP not configured, nothing was sent]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`);
    return;
  }

  await mailTransport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });
};
