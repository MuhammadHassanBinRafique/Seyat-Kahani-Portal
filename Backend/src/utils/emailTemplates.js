// Plain, table-free inline-styled HTML works in every mail app; a text version is always included.
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

const layout = ({ heading, intro, buttonText, link, note }) => `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px 12px;background:#f5f0e8;font-family:'Open Sans',Arial,Helvetica,sans-serif;color:#24312b;">
  <div style="max-width:480px;margin:0 auto;background:#fffdf8;border:1px solid #e3e6df;border-radius:16px;padding:32px 28px;">
    <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#2c4239;">Seyat Khani</p>
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#24312b;">${heading}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">${intro}</p>
    <p style="margin:0 0 24px;"><a href="${link}" style="display:inline-block;background:#2c4239;color:#f7f7f2;text-decoration:none;font-weight:700;font-size:14px;padding:14px 24px;border-radius:8px;">${buttonText}</a></p>
    <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#6f7c74;">If the button does not work, copy this address into your browser:</p>
    <p style="margin:0 0 24px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="${link}" style="color:#2c4239;">${link}</a></p>
    <p style="margin:0;font-size:13px;line-height:1.5;color:#6f7c74;">${note}</p>
  </div>
</body>
</html>`;

export const verificationEmail = ({ name, link }) => ({
  subject: "Verify your email - Seyat Khani",
  text: `Hi ${name},\n\nPlease verify your email address to finish setting up your Seyat Khani account:\n\n${link}\n\nThis link works for 24 hours. If you did not create an account, you can ignore this email.`,
  html: layout({
    heading: "Verify your email address",
    intro: `Hi ${escapeHtml(name)}, thanks for signing up. Please confirm your email address to finish setting up your account.`,
    buttonText: "Verify email",
    link,
    note: "This link works for 24 hours. If you did not create an account, you can safely ignore this email."
  })
});

export const passwordResetEmail = ({ name, link }) => ({
  subject: "Reset your password - Seyat Khani",
  text: `Hi ${name},\n\nWe received a request to reset your Seyat Khani password. Use this link to choose a new one:\n\n${link}\n\nThis link works for 1 hour. If you did not ask for this, you can ignore this email - your password will not change.`,
  html: layout({
    heading: "Reset your password",
    intro: `Hi ${escapeHtml(name)}, we received a request to reset your password. Click the button below to choose a new one.`,
    buttonText: "Reset password",
    link,
    note: "This link works for 1 hour. If you did not ask for this, ignore this email and your password will stay the same."
  })
});
