import Appointment from "../models/appointment.model.js";

// ================= GET MY PATIENTS (doctor only) =================
// A doctor's "patients" are the people they have a non-cancelled appointment with.
// This is the same relationship rule the medical record controller uses, so the
// directory and "who can I write a record for" always agree with each other.
export const getMyPatients = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            doctor: req.user.id,   // from the verified JWT, so a doctor only ever sees their own patients
            status: { $in: ["pending", "confirmed", "completed"] }
        }).populate("patient", "name email");

        const byPatient = new Map();

        for (const appt of appointments) {
            // populate() gives null if the patient's account was deleted — skip those.
            if (!appt.patient) continue;

            const key = appt.patient._id.toString();
            if (!byPatient.has(key)) {
                byPatient.set(key, {
                    id: key,
                    name: appt.patient.name,
                    email: appt.patient.email,
                    totalAppointments: 0,
                    lastVisit: null,      // date of the most recent COMPLETED appointment
                    hasUpcoming: false    // true if any pending/confirmed appointment exists
                });
            }

            const entry = byPatient.get(key);
            entry.totalAppointments += 1;

            if (appt.status === "completed") {
                // dates are stored as "YYYY-MM-DD", so plain string comparison sorts correctly
                if (!entry.lastVisit || appt.date > entry.lastVisit) {
                    entry.lastVisit = appt.date;
                }
            } else {
                entry.hasUpcoming = true;
            }
        }

        const patients = [...byPatient.values()].sort((a, b) => a.name.localeCompare(b.name));
        res.status(200).json(patients);

    } catch (error) {
        console.error("Get patients error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
