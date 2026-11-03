// One-time (and safe to repeat) script: marks every account that existed BEFORE email verification
// was introduced as verified - patients and doctors alike - so nobody is locked out.
//   npm run verify-existing      (from the Backend folder, with .env filled in)
// Run it BEFORE deploying the version that blocks login for unverified emails.
//
// Accounts created after the feature went live always have emailVerificationSentAt set (a
// verification email was issued for them), so this script never touches those.
import dotenv from "dotenv";
dotenv.config();
import { applyDnsServersFromEnv } from "../utils/dnsConfig.js";
applyDnsServersFromEnv(); // opt-in only (DNS_SERVERS in .env)
import mongoose from "mongoose";
import User from "../models/user.model.js";

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Database connected.");

  const filter = {
    deletedAt: null,
    isEmailVerified: { $ne: true },
    emailVerificationSentAt: { $exists: false }
  };

  const before = await User.aggregate([{ $match: filter }, { $group: { _id: "$role", count: { $sum: 1 } } }]);
  console.log("Accounts to verify:", before.length ? before.map((row) => `${row._id}: ${row.count}`).join(", ") : "none");

  const result = await User.updateMany(filter, { $set: { isEmailVerified: true } });
  console.log(`Marked ${result.modifiedCount} account(s) as verified.`);

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("verify-existing failed:", error);
  process.exit(1);
});
