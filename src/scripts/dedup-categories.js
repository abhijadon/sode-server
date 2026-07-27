/**
 * dedup-categories.js
 * 
 * Merges duplicate Category documents that share the same name.
 * - Keeps the FIRST document (lowest _id / earliest created)
 * - Collects all parentIds from duplicates into the kept doc's parentId array
 * - Updates PartnerCourse.category + PartnerCourse.categories references
 * - Deletes the duplicate docs
 * 
 * Run: node src/scripts/dedup-categories.js
 */

"use strict";

require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/sode";

async function dedup() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  console.log("✅ Connected.\n");

  const cats = await db.collection("categories").find({}).sort({ _id: 1 }).toArray();
  console.log(`📦 Total categories: ${cats.length}\n`);

  // Group by lowercase name
  const nameMap = new Map();
  for (const cat of cats) {
    const key = (cat.name || "").trim().toLowerCase();
    if (!nameMap.has(key)) nameMap.set(key, []);
    nameMap.get(key).push(cat);
  }

  let mergedCount = 0;
  let deletedCount = 0;

  for (const [name, group] of nameMap.entries()) {
    if (group.length <= 1) continue; // no duplicates

    // Sort by _id ascending — keep the first one
    group.sort((a, b) => (String(a._id) < String(b._id) ? -1 : 1));
    const keeper = group[0];
    const duplicates = group.slice(1);

    // Collect all parentIds from ALL docs in group (including keeper)
    const allParentIds = new Set();
    for (const doc of group) {
      const pid = doc.parentId;
      if (!pid) continue;
      if (Array.isArray(pid)) {
        pid.forEach((p) => p && allParentIds.add(String(p)));
      } else {
        allParentIds.add(String(pid));
      }
    }

    const mergedParentIds = Array.from(allParentIds).map((id) => new mongoose.Types.ObjectId(id));
    const duplicateIds = duplicates.map((d) => d._id);

    console.log(`🔀 Merging "${keeper.name}" (${group.length} docs):`);
    console.log(`   ✅ Keep:   ${keeper.slug} (_id: ${keeper._id})`);
    duplicates.forEach((d) => console.log(`   🗑  Delete: ${d.slug} (_id: ${d._id})`));
    console.log(`   📎 Merged parentIds: [${mergedParentIds.join(", ")}]`);

    // 1. Update keeper with merged parentIds
    await db.collection("categories").updateOne(
      { _id: keeper._id },
      { $set: { parentId: mergedParentIds } }
    );

    // 2. Update PartnerCourse.category references (single ref field)
    await db.collection("partnercourses").updateMany(
      { category: { $in: duplicateIds } },
      { $set: { category: keeper._id } }
    );

    // 3. Update PartnerCourse.categories array references
    for (const dupId of duplicateIds) {
      await db.collection("partnercourses").updateMany(
        { categories: dupId },
        { $set: { "categories.$": keeper._id } }
      );
    }

    // 4. Remove duplicate IDs from categories arrays and add keeper if missing
    await db.collection("partnercourses").updateMany(
      { categories: { $in: duplicateIds } },
      { $pull: { categories: { $in: duplicateIds } } }
    );
    await db.collection("partnercourses").updateMany(
      { category: keeper._id },
      { $addToSet: { categories: keeper._id } }
    );

    // 5. Delete duplicate category docs
    await db.collection("categories").deleteMany({ _id: { $in: duplicateIds } });

    mergedCount++;
    deletedCount += duplicateIds.length;
    console.log("");
  }

  console.log("📊 Deduplication Summary:");
  console.log(`   🔀 Name groups merged: ${mergedCount}`);
  console.log(`   🗑  Duplicate docs deleted: ${deletedCount}`);

  const remaining = await db.collection("categories").countDocuments();
  console.log(`   📦 Categories remaining: ${remaining}`);

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected. Done!");
}

dedup().catch((err) => {
  console.error("❌ Dedup failed:", err);
  process.exit(1);
});
