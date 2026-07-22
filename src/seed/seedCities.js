"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { State } = require("../model/State");
const { City } = require("../model/City");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

const upCities = [
  { name: "Lucknow", slug: "lucknow", desc: "Capital city of Uttar Pradesh", enabled: true },
  { name: "Kanpur", slug: "kanpur", desc: "Industrial and economic hub of Uttar Pradesh", enabled: true },
  { name: "Noida", slug: "noida", desc: "Major IT and industrial corporate hub in NCR", enabled: true },
  { name: "Ghaziabad", slug: "ghaziabad", desc: "Large industrial gateway city in NCR", enabled: true },
  { name: "Agra", slug: "agra", desc: "Historical city home to the Taj Mahal", enabled: true },
  { name: "Varanasi", slug: "varanasi", desc: "Spiritual and cultural capital of India", enabled: true },
  { name: "Prayagraj", slug: "prayagraj", desc: "Historical educational and administrative center", enabled: true },
  { name: "Meerut", slug: "meerut", desc: "Major sports goods manufacturing and ancient city", enabled: true },
  { name: "Bareilly", slug: "bareilly", desc: "Major commerce and educational hub", enabled: true },
  { name: "Aligarh", slug: "aligarh", desc: "Famous for lock industries and education university", enabled: true },
  { name: "Moradabad", slug: "moradabad", desc: "Brass handicraft export city", enabled: true },
  { name: "Saharanpur", slug: "saharanpur", desc: "Famous for wood carving cottage industry", enabled: true },
  { name: "Gorakhpur", slug: "gorakhpur", desc: "Historical city in eastern Uttar Pradesh", enabled: true },
  { name: "Ayodhya", slug: "ayodhya", desc: "Ancient historical and holy city of India", enabled: true },
  { name: "Jhansi", slug: "jhansi", desc: "Gateway state and historic fort city of Bundelkhand", enabled: true },
  { name: "Muzaffarnagar", slug: "muzaffarnagar", desc: "Sugar bowl city of western Uttar Pradesh", enabled: true },
  { name: "Mathura", slug: "mathura", desc: "Holy heritage birth city of Lord Krishna", enabled: true },
  { name: "Firozabad", slug: "firozabad", desc: "Glass industries and bangle city of India", enabled: true },
  { name: "Rampur", slug: "rampur", desc: "Historic library and industrial town", enabled: true },
  { name: "Shahjahanpur", slug: "shahjahanpur", desc: "Agricultural and sugar milling center", enabled: true },
  { name: "Hapur", slug: "hapur", desc: "Largest grain market in western Uttar Pradesh", enabled: true },
  { name: "Etawah", slug: "etawah", desc: "Historical city on the banks of Yamuna", enabled: true },
  { name: "Mirzapur", slug: "mirzapur", desc: "Famous for hand-knotted carpet and brassware", enabled: true },
  { name: "Bulandshahr", slug: "bulandshahr", desc: "Agricultural hub and ancient settlement", enabled: true },
  { name: "Sambhal", slug: "sambhal", desc: "Known for horn-bone handicrafts export", enabled: true },
  { name: "Amroha", slug: "amroha", desc: "Famous for mango production and hand drums", enabled: true },
  { name: "Fatehpur", slug: "fatehpur", desc: "Historic agricultural center in Doab region", enabled: true },
  { name: "Rae Bareli", slug: "rae-bareli", desc: "Major educational and manufacturing town", enabled: true },
  { name: "Orai", slug: "orai", desc: "Administrative center in Bundelkhand", enabled: true },
  { name: "Bahraich", slug: "bahraich", desc: "Agricultural city bordering Nepal", enabled: true },
  { name: "Jaunpur", slug: "jaunpur", desc: "Historic town famous for perfumes and architecture", enabled: true },
  { name: "Unnao", slug: "unnao", desc: "Industrial town adjacent to Kanpur", enabled: true },
  { name: "Sitapur", slug: "sitapur", desc: "Agricultural market hub in central UP", enabled: true },
  { name: "Banda", slug: "banda", desc: "Famous for Shajar stone art in Bundelkhand", enabled: true },
  { name: "Lakhimpur", slug: "lakhimpur", desc: "Known for sugar mills and national park borders", enabled: true },
  { name: "Hathras", slug: "hathras", desc: "Famous for Asafoetida (Hing) and cotton ginning", enabled: true },
  { name: "Lalitpur", slug: "lalitpur", desc: "Known for mineral resources and rock temples", enabled: true },
  { name: "Deoria", slug: "deoria", desc: "Agricultural and sugar processing center", enabled: true },
  { name: "Ghazipur", slug: "ghazipur", desc: "Famous for rose water perfume and opium factory", enabled: true },
  { name: "Basti", slug: "basti", desc: "Historic town in eastern Uttar Pradesh", enabled: true }
];

async function seedUpCities() {
  try {
    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    // 1. Fetch State record for Uttar Pradesh
    const uttarPradesh = await State.findOne({ slug: "uttar-pradesh" });
    if (!uttarPradesh) {
      console.error("❌ State record 'Uttar Pradesh' (slug: 'uttar-pradesh') not found in database! Please run seedStates.js first.");
      return;
    }
    
    console.log(`📌 Found Uttar Pradesh State ID: ${uttarPradesh._id}`);
    console.log(`🔄 Upserting ${upCities.length} Cities under Uttar Pradesh...`);
    let addedCount = 0;
    
    for (const cityItem of upCities) {
      // Map state reference
      cityItem.state = uttarPradesh._id;
      
      await City.findOneAndUpdate(
        { slug: cityItem.slug },
        { $set: cityItem },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
      console.log(`✅ Synced city: ${cityItem.name}`);
      addedCount++;
    }

    console.log(`🎉 Done! All ${addedCount} Uttar Pradesh Cities successfully seeded!`);
  } catch (error) {
    console.error("❌ Error seeding cities:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedUpCities();
