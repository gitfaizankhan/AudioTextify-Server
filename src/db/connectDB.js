import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );

    console.log(
      `✅ MongoDB connected at host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw new ApiError(500, "MongoDB connection failed");
  }
};

export default connectDB;
