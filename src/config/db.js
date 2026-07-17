"use strict";

const mongoose = require("mongoose");

/**
 * ✅ MongoDB Connection Manager
 * - सुनिश्चित करता है कि सर्वर स्टार्ट होने से पहले DB कनेक्ट हो।
 */
async function connectDB({
  uri = process.env.MONGODB_URI, // डिफ़ॉल्ट रूप से env से उठाएगा
  maxPoolSize = 50,
  minPoolSize = 5,
  socketTimeoutMS = 45000,
  serverSelectionTimeoutMS = 5000,
} = {}) {
  if (!uri) {
    throw new Error("❌ MONGODB_URI is missing in environment variables");
  }

  // यदि मोंगोडिबी पहले से कनेक्टेड है तो पुराना कनेक्शन ही रिटर्न करें (Fastify HMR/Reload safe)
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    // कनेक्शन इवेंट्स की ट्रैकिंग (लॉगिंग के लिए)
    mongoose.connection.on("connected", () => {
      console.log("🍃 MongoDB connected successfully.");
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
