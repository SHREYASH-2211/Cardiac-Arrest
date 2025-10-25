import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import connectDB from "./db/index.js";
import app from "./app.js"; // ✅ this app has your routes!

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`App is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    throw err;
  });
