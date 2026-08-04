/**
 * migrate-parentId-to-array.js
 * 
 * One-time migration script: converts Category documents where parentId is a
 * single ObjectId (old format) → [ObjectId] array (new format).
 * 
 * Run: node src/scripts/migrate-parentId-to-array.js
 */

"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Category } = require("../model/Category");

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/sode";

async function migrate() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected.\n");

  // Find all categories where parentId is NOT an array (old single ObjectId format)
  // In MongoDB, if the field was stored as a single ObjectId, it won't be an array
  const allCats = await mongoose.connection.db
    .collection("categories")
    .find({})
    .toArray();

  let migratedCount = 0;
  let alreadyArrayCount = 0;
  let nullCount = 0;

  for (const cat of allCats) {
    const pid = cat.parentId;

    if (pid === null || pid === undefined) {
      // Already null/empty — set to []
      await mongoose.connection.db.collection("categories").updateOne(
        { _id: cat._id },
        { $set: { parentId: [] } }
      );
      nullCount++;
    } else if (Array.isArray(pid)) {
      // Already an array — skip
      alreadyArrayCount++;
    } else {
      // Single ObjectId — convert to array
      await mongoose.connection.db.collection("categories").updateOne(
        { _id: cat._id },
        { $set: { parentId: [pid] } }
      );
      console.log(`  ↳ Migrated: "${cat.name}" (${cat.slug}) parentId: ${pid} → [${pid}]`);
      migratedCount++;
    }
  }

  console.log("\n📊 Migration Summary:");
  console.log(`  ✅ Migrated (single → array): ${migratedCount}`);
  console.log(`  ✅ Null → []:                 ${nullCount}`);
  console.log(`  ⏭  Already array (skipped):   ${alreadyArrayCount}`);
  console.log(`  📦 Total processed:            ${allCats.length}`);

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected. Migration complete!");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
