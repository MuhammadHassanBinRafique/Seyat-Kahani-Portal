import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // fail fast instead of buffering for 10s
  });
  console.log("Database connected successfully!");
};

export default connectDB;