"use strict";

const mongoose = require("mongoose");

/**
 * ✅ MongoDB Connection Manager
 * - सुनिश्चित करता है कि सर्वर स्टार्ट होने से पहले DB कनेक्ट हो।
 */
async function connectDB(options = {}) {
  const {
    uri = process.env.MONGODB_URI,
    maxPoolSize = 50,
    minPoolSize = 5,
    socketTimeoutMS = 45000,
    serverSelectionTimeoutMS = 5000,
    logger,
  } = options;
  if (!uri) {
    if (process.env.CI || process.env.SKIP_DB_CONNECT === "true") {
      if (logger) {
        logger.warn("⚠️ MONGODB_URI missing in CI environment; skipping DB connection check.");
      } else {
        console.warn("⚠️ MONGODB_URI missing in CI environment; skipping DB connection check.");
      }
      return mongoose;
    }
    throw new Error("❌ MONGODB_URI is missing in environment variables");
  }

  // यदि मोंगोडिबी पहले से कनेक्टेड है तो पुराना कनेक्शन ही रिटर्न करें (Fastify HMR/Reload safe)
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    // Connection event listeners
    mongoose.connection.on("connected", () => {
      if (logger) {
        logger.info("MongoDB Connected Successfully via Mongoose!");
      } else {
        console.log("MongoDB Connected Successfully via Mongoose!");
      }
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB connection disconnected.");
    });

    await mongoose.connect(uri, {
      maxPoolSize,
      minPoolSize,
      socketTimeoutMS,
      serverSelectionTimeoutMS,
    });

    return mongoose;
  } catch (err) {
    console.error("❌ Failed to initialize MongoDB connection:", err.message);
    throw err;
  }
}

module.exports = { connectDB };
