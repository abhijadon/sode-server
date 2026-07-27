"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { executeApiConfigByKey } = require("../service/apiConfig/apiConfigExecutor");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

async function testLeadApi() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 Connected to MongoDB.");

    const testPayload = {
      name: "abhishekte",
      email: "abhisgtte454@gmail.com",
      phone: "919160932788",
      course: "MBA",
      source: "DES",
      utm_source: "Organic",
      state: "Telangana",
    };

    console.log("📡 Executing CRM Lead API test request...");
    const result = await executeApiConfigByKey("crm_lead_api", testPayload, {
      reqMeta: {
        ip: "127.0.0.1",
        userAgent: "SODE CRM ApiConfig Test Script/2.0",
      },
    });

    console.log("\n📊 Test Execution Result:");
    console.log("Success:", result.success);
    console.log("Status Code:", result.statusCode);
    console.log("Response Data:", JSON.stringify(result.data, null, 2));
    console.log("Log ID:", result.log?._id);
  } catch (error) {
    console.error("❌ Error in testLeadApi:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

testLeadApi();
