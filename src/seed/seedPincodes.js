"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { City } = require("../model/City");
const { Pincode } = require("../model/Pincode");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

// Pincode map by city slug
const pincodeData = {
  noida: ["201301", "201303", "201304", "201305", "201306", "201307", "201308", "201309", "201310", "201313"],
  lucknow: ["226001", "226002", "226003", "226004", "226005", "226010", "226016", "226021", "226022", "226024"],
  kanpur: ["208001", "208002", "208003", "208004", "208005", "208016", "208025", "208027"],
  ghaziabad: ["201001", "201002", "201003", "201005", "201009", "201010", "201014"],
  prayagraj: ["211001", "211002", "211003", "211004", "211005", "211019"],
  varanasi: ["221001", "221002", "221003", "221005", "221007", "221010"]
};

async function seedPincodes() {
  try {
    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("🔍 Fetching City documents...");
    const cities = await City.find({ slug: { $in: Object.keys(pincodeData) } });
    
    if (cities.length === 0) {
      console.error("❌ No matching cities found (noida, lucknow, kanpur, ghaziabad, prayagraj, varanasi) in database! Please run seedCities.js first.");
      return;
    }

    const cityMap = {};
    cities.forEach(c => {
      cityMap[c.slug] = c._id;
    });

    console.log("🔄 Upserting Pincodes associated with cities...");
    let addedCount = 0;

    for (const [citySlug, codes] of Object.entries(pincodeData)) {
      const cityId = cityMap[citySlug];
      if (!cityId) {
        console.log(`⚠️ City with slug '${citySlug}' not found in database, skipping its pincodes.`);
        continue;
      }

      for (const code of codes) {
        const pinItem = {
          code: code,
          city: cityId,
          enabled: true
        };

        await Pincode.findOneAndUpdate(
          { code: pinItem.code },
          { $set: pinItem },
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        );
        console.log(`✅ Synced Pincode: ${code} for City: ${citySlug}`);
        addedCount++;
      }
    }

    console.log(`🎉 Done! All ${addedCount} Pincodes successfully seeded!`);
  } catch (error) {
    console.error("❌ Error seeding Pincodes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedPincodes();
