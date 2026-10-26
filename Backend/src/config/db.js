import mongoose from "mongoose";

// Only connects. One-time data/index work (backfills, duplicate clean-up, encrypting old
// records) lives in src/script/migrate.js, so it does not run on every serverless cold start.
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // fail fast instead of buffering for 10s
  });
  console.log("Database connected successfully!");
};

export default connectDB;
