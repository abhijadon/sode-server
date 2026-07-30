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
  apiKey: "YOUR_API_KEY",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "x-api-key", value: "YOUR_API_KEY" },
  ],
  bodyParams: [
    { key: "name", value: "{{full_name}}" },
    { key: "email", value: "{{email}}" },
    { key: "phone", value: "{{phone}}" },
    { key: "course", value: "{{course}}" },
    { key: "source", value: "SODE" },
    { key: "utm_source", value: "{{utm_source}}" },
    { key: "state", value: "{{state}}" },
    { key: "sub_source", value: "{{sub_source}}" },
    { key: "utm_medium", value: "{{utm_medium}}" },
    { key: "utm_campaign", value: "{{utm_campaign}}" },
    { key: "utm_term", value: "{{utm_term}}" },
    { key: "utm_content", value: "{{utm_content}}" },
    { key: "page_url", value: "{{page_url}}" },
    { key: "ip_address", value: "{{ip_address}}" },
    { key: "form_name", value: "{{form_name}}" },
  ],
  availableVariables: [
    { key: "{{full_name}}", description: "Lead's full name" },
    { key: "{{email}}", description: "Lead's email address" },
    { key: "{{phone}}", description: "Lead's phone number" },
    { key: "{{course}}", description: "Course selected by lead" },
    { key: "{{state}}", description: "Lead's state" },
    { key: "{{source}}", description: "Primary source (e.g. SODE)" },
    { key: "{{sub_source}}", description: "Sub-source" },
    { key: "{{utm_source}}", description: "UTM Source" },
    { key: "{{utm_medium}}", description: "UTM Medium" },
    { key: "{{utm_campaign}}", description: "UTM Campaign" },
    { key: "{{utm_term}}", description: "UTM Term" },
    { key: "{{utm_content}}", description: "UTM Content" },
    { key: "{{page_url}}", description: "Page URL where form was submitted" },
    { key: "{{ip_address}}", description: "User's IP Address" },
    { key: "{{form_name}}", description: "Name of the submitted form" },
  ],
  description: "External CRM lead forwarding endpoint (POST https://new.crm.api.mysode.com/api/lead/apicreated)",
  enabled: true,
  removed: false,
};

const gallaboxLeadApiConfig = {
  name: "Gallabox Lead Webhook",
  key: "gallabox_lead_api",
  baseUrl: "https://server.gallabox.com/accounts/61fce6fd9b042a00049ddbc1/integrations/genericWebhook/68494566ef0bd3067b0f3a8d/webhook",
  endpoint: "",
  method: "POST",
  triggerEvent: "lead_submission",
  version: "v1",
  timeout: 10000,
  retryCount: 3,
  environment: "production",
  authType: "none",
  headers: [{ key: "Content-Type", value: "application/json" }],
  bodyParams: [
    { key: "name", value: "{{full_name}}" },
    { key: "phone", value: "{{phoneWithPlus}}" },
    { key: "email", value: "{{email}}" },
    { key: "course", value: "{{course}}" },
    { key: "state", value: "{{state}}" },
    { key: "source", value: "SODE" },
    { key: "utm_source", value: "{{utm_source}}" },
    { key: "utm_medium", value: "{{utm_medium}}" },
    { key: "utm_campaign", value: "{{utm_campaign}}" },
    { key: "utm_term", value: "{{utm_term}}" },
    { key: "utm_content", value: "{{utm_content}}" }
  ],
  requestBody: { tags: ["Success"] },
  availableVariables: crmLeadApiConfig.availableVariables,
  description: "Gallabox webhook",
  enabled: true,
  removed: false,
};

const brevoLeadApiConfig = {
  name: "Brevo Contacts API",
  key: "brevo_lead_api",
  baseUrl: "https://api.brevo.com/v3/contacts",
  endpoint: "",
  method: "POST",
  triggerEvent: "lead_submission",
  version: "v1",
  timeout: 10000,
  retryCount: 3,
  environment: "production",
  authType: "apiKey",
  apiKey: "YOUR_BREVO_API_KEY",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "api-key", value: "YOUR_BREVO_API_KEY" }
  ],
  bodyParams: [
    { key: "email", value: "{{email}}" },
    { key: "attributes.FULLNAME", value: "{{full_name}}" },
    { key: "attributes.SMS", value: "{{phoneWithPlus}}" },
    { key: "attributes.MOBILE", value: "{{phoneWithPlus}}" },
    { key: "attributes.COURSES", value: "{{course}}" },
    { key: "attributes.STATES", value: "{{state}}" },
    { key: "attributes.UTM_SOURCE", value: "{{utm_source}}" },
    { key: "attributes.UTM_CAMPAIGN", value: "{{utm_campaign}}" },
    { key: "attributes.UTM_MEDIUM", value: "{{utm_medium}}" },
    { key: "attributes.UTM_TERM", value: "{{utm_term}}" },
    { key: "attributes.SOURCE", value: "SODE" },
    { key: "listIds", value: "[217]" },
    { key: "updateEnabled", value: "true" }
  ],
  requestBody: {},
  availableVariables: crmLeadApiConfig.availableVariables,
  description: "Brevo contacts sync",
  enabled: true,
  removed: false,
};

async function seedApiConfigs() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    const configs = [crmLeadApiConfig, gallaboxLeadApiConfig, brevoLeadApiConfig];

    for (const config of configs) {
      const doc = await ApiConfig.findOneAndUpdate(
        { key: config.key },
        { $set: config },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
      console.log(`✅ Seeded ApiConfig: "${doc.name}"`);
    }

    console.log(`🎉 ApiConfig seeding completed!`);
  } catch (error) {
    console.error("❌ Error seeding ApiConfig:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedApiConfigs();
