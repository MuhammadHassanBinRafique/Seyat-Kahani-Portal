import { test, describe, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

process.env.LOG_LEVEL = "silent";
process.env.JWT_SECRET_KEY = "test-secret";
delete process.env.SMTP_HOST; // no real mail: the mailer prints "[DEV EMAIL ...]" instead

const { default: User } = await import("../src/models/user.model.js");
const { login } = await import("../src/controllers/authController.js");
const { resendVerification } = await import("../src/controllers/emailAuthController.js");

const makeRes = () => ({
  code: 200,
  body: null,
  status(code) { this.code = code; return this; },
  json(body) { this.body = body; return this; }
});

describe("who has to verify their email", () => {
  const PASSWORD = "correct-horse-1";
  let hash;
  let sent;

  const account = (over) => ({
    _id: "u1", name: "Test", email: "x@example.com", role: "patient", isEmailVerified: false,
    tokenVersion: 0, deletedAt: null, password: hash, save: async function () { return this; }, ...over
  });
  const loginAs = async (user, password = PASSWORD) => {
    mock.method(User, "findOne", async () => user);
    const res = makeRes();
    await login({ body: { email: user.email, password } }, res);
    return res;
  };

  beforeEach(async () => {
    hash ??= await bcrypt.hash(PASSWORD, 4);
    sent = [];
    mock.method(console, "log", (...args) => { if (String(args[0]).includes("[DEV EMAIL")) sent.push(String(args[0])); });
  });
  afterEach(() => mock.restoreAll());

  test("an unverified PATIENT cannot log in", async () => {
    const res = await loginAs(account({ role: "patient", isEmailVerified: false }));
    assert.equal(res.code, 403);
    assert.equal(res.body.code, "EMAIL_NOT_VERIFIED");
    assert.equal(res.body.token, undefined);
  });

  test("a DOCTOR can log in even though their @seyatkahani.com address was never verified", async () => {
    const res = await loginAs(account({ role: "doctor", email: "sarah@seyatkahani.com", isEmailVerified: false }));
    assert.equal(res.code, 200);
    assert.ok(res.body.token);
  });

  test("a verified patient can log in", async () => {
    const res = await loginAs(account({ role: "patient", isEmailVerified: true }));
    assert.equal(res.code, 200);
  });

  test("the verification check never replaces the password check", async () => {
    const res = await loginAs(account({ role: "patient", isEmailVerified: false }), "wrong-password-1");
    assert.equal(res.code, 400);
    assert.equal(res.body.code, undefined); // nothing that reveals the account exists
  });

  test("'resend verification' never emails a doctor address", async () => {
    mock.method(User, "findOne", async () => account({ role: "doctor", email: "sarah@seyatkahani.com", isEmailVerified: false }));
    const res = makeRes();
    await resendVerification({ body: { email: "sarah@seyatkahani.com" } }, res);
    assert.equal(res.code, 200);
    assert.equal(sent.length, 0);
  });

  test("'resend verification' still emails an unverified patient", async () => {
    mock.method(User, "findOne", async () => account({ role: "patient", isEmailVerified: false }));
    const res = makeRes();
    await resendVerification({ body: { email: "x@example.com" } }, res);
    assert.equal(res.code, 200);
    assert.equal(sent.length, 1);
  });
});
