"use strict";

require("module-alias/register");
require("dotenv").config();
const app = require("@/app");
const { connectDB } = require("./config/db");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

async function startServer() {
  try {
    console.log("🚀 Starting initialization sequence...");

    // 1. सबसे पहले डेटाबेस कनेक्ट करें
    await connectDB();

    // 2. डेटाबेस कनेक्शन सफल होने के बाद ही Fastify सर्वर पोर्ट ओपन करें
    await app.listen({
      port: PORT,
      host: HOST,
    });

    console.log(`⚡ Fastify Server running on http://${HOST}:${PORT}`);
  } catch (error) {
    // अगर DB या सर्वर लिसन में कोई भी एरर आता है, तो एरर लॉग करें और सेफली एग्जिट करें
    if (app.log && typeof app.log.error === "function") {
      app.log.error(error);
    } else {
      console.error("❌ Startup Error:", error);
    }
    process.exit(1);
  }
}

startServer();