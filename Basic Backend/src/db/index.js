import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

dotenv.config();

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGO_URI || process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`,
    );

    console.log("MongoDB connected!");
    console.log("Connection host:", connectionInstance.connection.host);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};

export default connectDB;
