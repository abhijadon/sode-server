require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

async function run() {
  try {
    // Load config relative to server directory
    require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
    await mongoose.connect(process.env.DATABASE_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
    const { University } = require('./src/model/University');
    
    const uniName = "O.P. Jindal Global University";
    const slug = uniName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    
    let uni = await University.findOne({ slug });
    if (!uni) {
      uni = await University.create({
        name: uniName,
        slug: slug,
        enabled: true,
        removed: false
      });
      console.log(`Successfully added university: ${uni.name}`);
    } else {
      console.log(`University already exists: ${uni.name}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
