"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Country } = require("../model/Country");
const { State } = require("../model/State");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

const indianStates = [
  // ── States ──
  { name: "Andhra Pradesh", slug: "andhra-pradesh", desc: "State of Andhra Pradesh", enabled: true },
  { name: "Arunachal Pradesh", slug: "arunachal-pradesh", desc: "State of Arunachal Pradesh", enabled: true },
  { name: "Assam", slug: "assam", desc: "State of Assam", enabled: true },
  { name: "Bihar", slug: "bihar", desc: "State of Bihar", enabled: true },
  { name: "Chhattisgarh", slug: "chhattisgarh", desc: "State of Chhattisgarh", enabled: true },
  { name: "Goa", slug: "goa", desc: "State of Goa", enabled: true },
  { name: "Gujarat", slug: "gujarat", desc: "State of Gujarat", enabled: true },
  { name: "Haryana", slug: "haryana", desc: "State of Haryana", enabled: true },
  { name: "Himachal Pradesh", slug: "himachal-pradesh", desc: "State of Himachal Pradesh", enabled: true },
  { name: "Jharkhand", slug: "jharkhand", desc: "State of Jharkhand", enabled: true },
  { name: "Karnataka", slug: "karnataka", desc: "State of Karnataka", enabled: true },
  { name: "Kerala", slug: "kerala", desc: "State of Kerala", enabled: true },
  { name: "Madhya Pradesh", slug: "madhya-pradesh", desc: "State of Madhya Pradesh", enabled: true },
  { name: "Maharashtra", slug: "maharashtra", desc: "State of Maharashtra", enabled: true },
  { name: "Manipur", slug: "manipur", desc: "State of Manipur", enabled: true },
  { name: "Meghalaya", slug: "meghalaya", desc: "State of Meghalaya", enabled: true },
  { name: "Mizoram", slug: "mizoram", desc: "State of Mizoram", enabled: true },
  { name: "Nagaland", slug: "nagaland", desc: "State of Nagaland", enabled: true },
  { name: "Odisha", slug: "odisha", desc: "State of Odisha", enabled: true },
  { name: "Punjab", slug: "punjab", desc: "State of Punjab", enabled: true },
  { name: "Rajasthan", slug: "rajasthan", desc: "State of Rajasthan", enabled: true },
  { name: "Sikkim", slug: "sikkim", desc: "State of Sikkim", enabled: true },
  { name: "Tamil Nadu", slug: "tamil-nadu", desc: "State of Tamil Nadu", enabled: true },
  { name: "Telangana", slug: "telangana", desc: "State of Telangana", enabled: true },
  { name: "Tripura", slug: "tripura", desc: "State of Tripura", enabled: true },
  { name: "Uttar Pradesh", slug: "uttar-pradesh", desc: "State of Uttar Pradesh", enabled: true },
  { name: "Uttarakhand", slug: "uttarakhand", desc: "State of Uttarakhand", enabled: true },
  { name: "West Bengal", slug: "west-bengal", desc: "State of West Bengal", enabled: true },

  // ── Union Territories ──
  { name: "Delhi", slug: "delhi", desc: "National Capital Territory of Delhi", enabled: true },
  { name: "Jammu and Kashmir", slug: "jammu-kashmir", desc: "Union Territory of Jammu & Kashmir", enabled: true },
  { name: "Ladakh", slug: "ladakh", desc: "Union Territory of Ladakh", enabled: true },
  { name: "Puducherry", slug: "puducherry", desc: "Union Territory of Puducherry", enabled: true },
  { name: "Chandigarh", slug: "chandigarh", desc: "Union Territory of Chandigarh", enabled: true },
  { name: "Dadra and Nagar Haveli and Daman and Diu", slug: "dadra-nagar-haveli-daman-diu", desc: "Union Territory of Dadra & Nagar Haveli and Daman & Diu", enabled: true },
  { name: "Lakshadweep", slug: "lakshadweep", desc: "Union Territory of Lakshadweep", enabled: true },
  { name: "Andaman and Nicobar Islands", slug: "andaman-nicobar", desc: "Union Territory of Andaman & Nicobar Islands", enabled: true }
];

async function seedIndianStates() {
  try {
    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    // 1. India Country details lookup
    const india = await Country.findOne({ slug: "india" });
    if (!india) {
      console.error("❌ Country record 'India' (slug: 'india') not found in database! Please run seedCountries.js first.");
      return;
    }
    
    console.log(`📌 Found India country ID: ${india._id}`);
    console.log(`🔄 Upserting ${indianStates.length} Indian States & UTs...`);
    let addedCount = 0;
    
    for (const stateItem of indianStates) {
      // Map state item country reference field
      stateItem.country = india._id;
      
      await State.findOneAndUpdate(
        { slug: stateItem.slug },
        { $set: stateItem },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
      console.log(`✅ Synced state: ${stateItem.name}`);
      addedCount++;
    }

    console.log(`🎉 Done! All ${addedCount} Indian States & Union Territories successfully seeded!`);
  } catch (error) {
    console.error("❌ Error seeding Indian states:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedIndianStates();
