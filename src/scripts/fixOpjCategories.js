const mongoose = require("mongoose");
const { Category } = require("../model/Category");
require("dotenv").config();

async function restoreBrowseParent() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB!");

  const browseCat = await Category.findOne({ slug: "browse-by-category" });
  if (!browseCat) {
    console.log("Browse By Category not found");
    process.exit(0);
  }

  const oldCatsToRestore = ["Finance", "AI Courses", "Leadership", "Management"];

  for (const name of oldCatsToRestore) {
    const cat = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") }, removed: false });
    if (cat && !cat.parentId.includes(browseCat._id)) {
      await Category.updateOne(
        { _id: cat._id },
        { $addToSet: { parentId: browseCat._id } }
      );
      console.log(`Restored 'Browse By Category' parent to ${name}`);
    }
  }

  console.log("Done!");
  process.exit(0);
}

restoreBrowseParent().catch(console.error);
