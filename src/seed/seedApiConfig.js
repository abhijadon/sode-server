"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { ApiConfig } = require("../model/ApiConfig");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

const crmLeadApiConfig = {
  name: "CRM Lead Creation API",
  key: "crm_lead_api",
  baseUrl: "https://new.crm.api.mysode.com",
  endpoint: "/api/lead/apicreated",
  method: "POST",
  triggerEvent: "lead_submission",
  version: "v1",
  timeout: 10000,
  retryCount: 3,
  environment: "production",
  authType: "apiKey",
  apiKey: "a04b4291461f8b060559dfc965864c2c2590e6edd2f5aa7a49388484a1953f22",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "x-api-key", value: "a04b4291461f8b060559dfc965864c2c2590e6edd2f5aa7a49388484a1953f22" },
  ],
  bodyParams: [
    { key: "name", value: "abhishekte" },
    { key: "email", value: "abhisgtte454@gmail.com" },
    { key: "phone", value: "919160932788" },
    { key: "course", value: "MBABDA" },
    { key: "source", value: "SODE" },
    { key: "utm_source", value: "Organic" },
    { key: "state", value: "Telangana" },
  ],
  description: "External CRM lead forwarding endpoint (POST https://new.crm.api.mysode.com/api/lead/apicreated)",
  enabled: true,
  removed: false,
};

async function seedApiConfigs() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    const doc = await ApiConfig.findOneAndUpdate(
      { key: crmLeadApiConfig.key },
      { $set: crmLeadApiConfig },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    console.log(`✅ Seeded ApiConfig with Body Parameters: "${doc.name}" (${doc.bodyParams.length} params)`);
    console.log(`🎉 ApiConfig seeding completed!`);
  } catch (error) {
    console.error("❌ Error seeding ApiConfig:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedApiConfigs();
