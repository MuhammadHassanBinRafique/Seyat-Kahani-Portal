import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";

// The one place a patient account gets deleted (self-delete and doctor-delete both use it).
// - The account is kept (soft delete) so appointment/medical history stays intact.
// - tokenVersion is bumped, so every token the user holds stops working immediately.
// - email/googleId/password are released, so the person can sign up again later
//   (email and googleId have unique indexes and would otherwise stay locked forever).
// - Their open appointments are cancelled, so they stop holding the doctor's slots.
// Returns the deleted user, or null if there was no such active patient.
export const softDeleteUser = async (userId) => {
  const deletedUser = await User.findOneAndUpdate(
    { _id: userId, role: "patient", deletedAt: null },
    {
      $set: { deletedAt: new Date(), email: `deleted+${userId}@deleted.invalid` },
      $inc: { tokenVersion: 1 },
      $unset: { googleId: "", password: "" }
    },
    { new: true }
  );

  if (!deletedUser) return null;

  await Appointment.updateMany(
    { patient: userId, status: { $in: ["pending", "confirmed"] }, deletedAt: null },
    { $set: { status: "cancelled", isActive: false } }
  );

  return deletedUser;
};
