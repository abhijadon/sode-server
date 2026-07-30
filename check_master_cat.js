require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.DATABASE_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sode-crm");
    const Category = require('./src/model/Category').Category;
    const masterCat = await Category.findOne({ name: { $regex: /^master/i }, removed: false }).lean();
    console.log("Master Category:", JSON.stringify(masterCat, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
