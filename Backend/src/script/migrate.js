// One-time, safe-to-repeat migration. Run after deploying this version:
//   npm run migrate        (from the Backend folder, with .env filled in)
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";
import { encryptField, isEncrypted } from "../utils/fieldCrypto.js";

const SLOT_INDEX = "doctor_date_time_active_unique";
const ENCRYPTED_FIELDS = ["diagnosis", "notes", "prescription"];

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Database connected.");

  // 1) Every user needs a tokenVersion (used to revoke tokens).
  const users = await User.updateMany({ tokenVersion: { $exists: false } }, { $set: { tokenVersion: 0 } });
  console.log(`tokenVersion backfilled on ${users.modifiedCount} user(s).`);

  // 1b) Accounts soft-deleted before this version still hold their email/googleId, which blocks
  //      the person from signing up again. Release them the same way softDeleteUser does.
  let released = 0;
  const alreadyDeleted = User.collection.find({
    deletedAt: { $ne: null },
    email: { $not: /^deleted\+.+@deleted\.invalid$/ }
  });
  for await (const user of alreadyDeleted) {
    await User.collection.updateOne(
      { _id: user._id },
      { $set: { email: `deleted+${user._id}@deleted.invalid` }, $unset: { googleId: "", password: "" }, $inc: { tokenVersion: 1 } }
    );
    await Appointment.updateMany(
      { patient: user._id, status: { $in: ["pending", "confirmed"] }, deletedAt: null },
      { $set: { status: "cancelled", isActive: false } }
    );
    released += 1;
  }
  console.log(`Emails released for ${released} previously deleted account(s).`);

  // 2) Appointments need isActive (cancelled or deleted ones do not hold a slot).
  await Appointment.createCollection();
  const slots = Appointment.collection;
  const active = await slots.updateMany(
    { isActive: { $exists: false } },
    [{ $set: { isActive: { $and: [{ $ne: ["$status", "cancelled"] }, { $eq: [{ $ifNull: ["$deletedAt", null] }, null] }] } } }]
  );
  console.log(`isActive backfilled on ${active.modifiedCount} appointment(s).`);

  // 3) Drop the old non-unique doctor+date+time index (the new unique one replaces it).
  for (const index of await slots.indexes()) {
    if (index.name !== "_id_" && index.name !== SLOT_INDEX &&
        index.key?.doctor === 1 && index.key?.date === 1 && index.key?.time === 1) {
      await slots.dropIndex(index.name);
      console.log(`Dropped legacy index ${index.name}.`);
    }
  }

  // 4) Older data may already contain double bookings, which would block the unique index.
  //    Keep the earliest booking of each slot and deactivate the rest.
  const duplicates = await Appointment.aggregate([
    { $match: { isActive: true } },
    { $sort: { _id: 1 } },
    { $group: { _id: { doctor: "$doctor", date: "$date", time: "$time" }, ids: { $push: "$_id" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  for (const duplicate of duplicates) {
    await Appointment.updateMany({ _id: { $in: duplicate.ids.slice(1) } }, { $set: { isActive: false } });
  }
  console.log(`Double-booked slots cleaned: ${duplicates.length}.`);

  // 5) Build the unique "one active appointment per doctor slot" index.
  await Appointment.createIndexes();
  console.log("Appointment slot index ready.");

  // 6) Encrypt medical records saved before encryption existed.
  //    Uses the raw collection on purpose, so the model's own encrypt step does not run twice.
  let encrypted = 0;
  for await (const record of MedicalRecord.collection.find({})) {
    const changes = {};
    for (const field of ENCRYPTED_FIELDS) {
      if (typeof record[field] === "string" && record[field] !== "" && !isEncrypted(record[field])) {
        changes[field] = encryptField(record[field]);
      }
    }
    if (Object.keys(changes).length > 0) {
      await MedicalRecord.collection.updateOne({ _id: record._id }, { $set: changes });
      encrypted += 1;
    }
  }
  console.log(`Medical records encrypted: ${encrypted}.`);

  console.log("Migration finished.");
  process.exit(0);
};

migrate().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
