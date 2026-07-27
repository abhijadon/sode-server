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
    console.error("❌ STARTUP ERROR DETAILS:", error);
    process.exit(1);
  }
}

startServer();