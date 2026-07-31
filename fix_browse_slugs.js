const mongoose = require("mongoose");
const { Category } = require("./src/model/Category");
require("dotenv").config();

function slugify(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  
  const cats = await Category.find({ slug: /^browse-/i });
  let count = 0;
  
  for (const cat of cats) {
    if (cat.slug === "browse-by-category") continue; // keep this one

    const newSlug = slugify(cat.name);
    console.log(`Updating ${cat.name}: ${cat.slug} -> ${newSlug}`);
    cat.slug = newSlug;
    await cat.save();
    count++;
  }
  
  console.log(`Updated ${count} categories successfully.`);
  process.exit(0);
}
run();
