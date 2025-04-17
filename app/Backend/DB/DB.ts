import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB = process.env.MONGODB_DB as string;

if (!MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to your .env.local file");
}

if (!MONGODB_DB) {
  throw new Error("Please add MONGODB_DB to your .env.local file");
}

export async function connectDB() {
  try {
    await mongoose.connect(`${MONGODB_URI}/${MONGODB_DB}`, {
      maxPoolSize: 10,
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}