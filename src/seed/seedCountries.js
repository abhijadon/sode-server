"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Country } = require("../model/Country");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

const sampleCountries = [
  // ── Existing 52 ──
  { name: "India", slug: "india", desc: "Republic of India", enabled: true },
  { name: "United States", slug: "united-states", desc: "United States of America", enabled: true },
  { name: "United Kingdom", slug: "united-kingdom", desc: "United Kingdom", enabled: true },
  { name: "United Arab Emirates", slug: "united-arab-emirates", desc: "United Arab Emirates", enabled: true },
  { name: "Singapore", slug: "singapore", desc: "Republic of Singapore", enabled: true },
  { name: "Canada", slug: "canada", desc: "Canada", enabled: true },
  { name: "Australia", slug: "australia", desc: "Commonwealth of Australia", enabled: true },
  { name: "Germany", slug: "germany", desc: "Federal Republic of Germany", enabled: true },
  { name: "France", slug: "france", desc: "French Republic", enabled: true },
  { name: "Japan", slug: "japan", desc: "Japan", enabled: true },
  { name: "China", slug: "china", desc: "People's Republic of China", enabled: true },
  { name: "Brazil", slug: "brazil", desc: "Federative Republic of Brazil", enabled: true },
  { name: "South Africa", slug: "south-africa", desc: "Republic of South Africa", enabled: true },
  { name: "Russia", slug: "russia", desc: "Russian Federation", enabled: true },
  { name: "Italy", slug: "italy", desc: "Italian Republic", enabled: true },
  { name: "Spain", slug: "spain", desc: "Kingdom of Spain", enabled: true },
  { name: "Netherlands", slug: "netherlands", desc: "Kingdom of the Netherlands", enabled: true },
  { name: "Switzerland", slug: "switzerland", desc: "Swiss Confederation", enabled: true },
  { name: "Sweden", slug: "sweden", desc: "Kingdom of Sweden", enabled: true },
  { name: "Norway", slug: "norway", desc: "Kingdom of Norway", enabled: true },
  { name: "Denmark", slug: "denmark", desc: "Kingdom of Denmark", enabled: true },
  { name: "Finland", slug: "finland", desc: "Republic of Finland", enabled: true },
  { name: "New Zealand", slug: "new-zealand", desc: "New Zealand", enabled: true },
  { name: "Ireland", slug: "ireland", desc: "Republic of Ireland", enabled: true },
  { name: "Belgium", slug: "belgium", desc: "Kingdom of Belgium", enabled: true },
  { name: "Austria", slug: "austria", desc: "Republic of Austria", enabled: true },
  { name: "Saudi Arabia", slug: "saudi-arabia", desc: "Kingdom of Saudi Arabia", enabled: true },
  { name: "Qatar", slug: "qatar", desc: "State of Qatar", enabled: true },
  { name: "Oman", slug: "oman", desc: "Sultanate of Oman", enabled: true },
  { name: "Kuwait", slug: "kuwait", desc: "State of Kuwait", enabled: true },
  { name: "Bahrain", slug: "bahrain", desc: "Kingdom of Bahrain", enabled: true },
  { name: "Malaysia", slug: "malaysia", desc: "Malaysia", enabled: true },
  { name: "Thailand", slug: "thailand", desc: "Kingdom of Thailand", enabled: true },
  { name: "Indonesia", slug: "indonesia", desc: "Republic of Indonesia", enabled: true },
  { name: "Philippines", slug: "philippines", desc: "Republic of the Philippines", enabled: true },
  { name: "Vietnam", slug: "vietnam", desc: "Socialist Republic of Vietnam", enabled: true },
  { name: "South Korea", slug: "south-korea", desc: "Republic of Korea", enabled: true },
  { name: "Egypt", slug: "egypt", desc: "Arab Republic of Egypt", enabled: true },
  { name: "Turkey", slug: "turkey", desc: "Republic of Turkey", enabled: true },
  { name: "Mexico", slug: "mexico", desc: "United Mexican States", enabled: true },
  { name: "Argentina", slug: "argentina", desc: "Argentine Republic", enabled: true },
  { name: "Chile", slug: "chile", desc: "Republic of Chile", enabled: true },
  { name: "Colombia", slug: "colombia", desc: "Republic of Colombia", enabled: true },
  { name: "Peru", slug: "peru", desc: "Republic of Peru", enabled: true },
  { name: "Poland", slug: "poland", desc: "Republic of Poland", enabled: true },
  { name: "Czech Republic", slug: "czech-republic", desc: "Czech Republic", enabled: true },
  { name: "Hungary", slug: "hungary", desc: "Hungary", enabled: true },
  { name: "Greece", slug: "greece", desc: "Hellenic Republic", enabled: true },
  { name: "Portugal", slug: "portugal", desc: "Portuguese Republic", enabled: true },
  { name: "Israel", slug: "israel", desc: "State of Israel", enabled: true },
  { name: "Kenya", slug: "kenya", desc: "Republic of Kenya", enabled: true },
  { name: "Nigeria", slug: "nigeria", desc: "Federal Republic of Nigeria", enabled: true },

  // ── New 51 ──
  { name: "Morocco", slug: "morocco", desc: "Kingdom of Morocco", enabled: true },
  { name: "Algeria", slug: "algeria", desc: "People's Democratic Republic of Algeria", enabled: true },
  { name: "Tunisia", slug: "tunisia", desc: "Republic of Tunisia", enabled: true },
  { name: "Ghana", slug: "ghana", desc: "Republic of Ghana", enabled: true },
  { name: "Ethiopia", slug: "ethiopia", desc: "Federal Democratic Republic of Ethiopia", enabled: true },
  { name: "Uganda", slug: "uganda", desc: "Republic of Uganda", enabled: true },
  { name: "Tanzania", slug: "tanzania", desc: "United Republic of Tanzania", enabled: true },
  { name: "Pakistan", slug: "pakistan", desc: "Islamic Republic of Pakistan", enabled: true },
  { name: "Bangladesh", slug: "bangladesh", desc: "People's Republic of Bangladesh", enabled: true },
  { name: "Sri Lanka", slug: "sri-lanka", desc: "Democratic Socialist Republic of Sri Lanka", enabled: true },
  { name: "Nepal", slug: "nepal", desc: "Federal Democratic Republic of Nepal", enabled: true },
  { name: "Bhutan", slug: "bhutan", desc: "Kingdom of Bhutan", enabled: true },
  { name: "Maldives", slug: "maldives", desc: "Republic of Maldives", enabled: true },
  { name: "Myanmar", slug: "myanmar", desc: "Republic of the Union of Myanmar", enabled: true },
  { name: "Cambodia", slug: "cambodia", desc: "Kingdom of Cambodia", enabled: true },
  { name: "Laos", slug: "laos", desc: "Lao People's Democratic Republic", enabled: true },
  { name: "Mongolia", slug: "mongolia", desc: "Mongolia", enabled: true },
  { name: "Kazakhstan", slug: "kazakhstan", desc: "Republic of Kazakhstan", enabled: true },
  { name: "Uzbekistan", slug: "uzbekistan", desc: "Republic of Uzbekistan", enabled: true },
  { name: "Ukraine", slug: "ukraine", desc: "Ukraine", enabled: true },
  { name: "Romania", slug: "romania", desc: "Romania", enabled: true },
  { name: "Bulgaria", slug: "bulgaria", desc: "Republic of Bulgaria", enabled: true },
  { name: "Croatia", slug: "croatia", desc: "Republic of Croatia", enabled: true },
  { name: "Serbia", slug: "serbia", desc: "Republic of Serbia", enabled: true },
  { name: "Slovakia", slug: "slovakia", desc: "Slovak Republic", enabled: true },
  { name: "Slovenia", slug: "slovenia", desc: "Republic of Slovenia", enabled: true },
  { name: "Lithuania", slug: "lithuania", desc: "Republic of Lithuania", enabled: true },
  { name: "Latvia", slug: "latvia", desc: "Republic of Latvia", enabled: true },
  { name: "Estonia", slug: "estonia", desc: "Republic of Estonia", enabled: true },
  { name: "Iceland", slug: "iceland", desc: "Republic of Iceland", enabled: true },
  { name: "Luxembourg", slug: "luxembourg", desc: "Grand Duchy of Luxembourg", enabled: true },
  { name: "Cyprus", slug: "cyprus", desc: "Republic of Cyprus", enabled: true },
  { name: "Malta", slug: "malta", desc: "Republic of Malta", enabled: true },
  { name: "Jordan", slug: "jordan", desc: "Hashemite Kingdom of Jordan", enabled: true },
  { name: "Lebanon", slug: "lebanon", desc: "Lebanese Republic", enabled: true },
  { name: "Iraq", slug: "iraq", desc: "Republic of Iraq", enabled: true },
  { name: "Iran", slug: "iran", desc: "Islamic Republic of Iran", enabled: true },
  { name: "Venezuela", slug: "venezuela", desc: "Bolivarian Republic of Venezuela", enabled: true },
  { name: "Uruguay", slug: "uruguay", desc: "Eastern Republic of Uruguay", enabled: true },
  { name: "Paraguay", slug: "paraguay", desc: "Republic of Paraguay", enabled: true },
  { name: "Bolivia", slug: "bolivia", desc: "Plurinational State of Bolivia", enabled: true },
  { name: "Ecuador", slug: "ecuador", desc: "Republic of Ecuador", enabled: true },
  { name: "Costa Rica", slug: "costa-rica", desc: "Republic of Costa Rica", enabled: true },
  { name: "Panama", slug: "panama", desc: "Republic of Panama", enabled: true },
  { name: "Guatemala", slug: "guatemala", desc: "Republic of Guatemala", enabled: true },
  { name: "Dominican Republic", slug: "dominican-republic", desc: "Dominican Republic", enabled: true },
  { name: "Jamaica", slug: "jamaica", desc: "Jamaica", enabled: true },
  { name: "Cuba", slug: "cuba", desc: "Republic of Cuba", enabled: true },
  { name: "Azerbaijan", slug: "azerbaijan", desc: "Republic of Azerbaijan", enabled: true },
  { name: "Georgia", slug: "georgia", desc: "Georgia", enabled: true },
  { name: "Armenia", slug: "armenia", desc: "Republic of Armenia", enabled: true },
  { name: "Monaco", slug: "monaco", desc: "Principality of Monaco", enabled: true }
];

async function seedDefaultCountries() {
  try {
    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log(`🔄 Upserting all ${sampleCountries.length} Country records...`);
    let addedCount = 0;
    
    for (const item of sampleCountries) {
      await Country.findOneAndUpdate(
        { slug: item.slug },
        { $set: item },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
      console.log(`✅ Synced country: ${item.name} (${item.slug})`);
      addedCount++;
    }

    console.log(`🎉 Done! All ${addedCount} countries successfully seeded!`);
  } catch (error) {
    console.error("❌ Error seeding countries:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedDefaultCountries();
