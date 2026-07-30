require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.DATABASE_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sode-crm");
    const Category = require('./src/model/Category').Category;
    const cats = await Category.find({ removed: false }).sort({ order: 1 }).select('name order type').lean();
    cats.forEach(c => console.log(`${c.name}: ${c.order} (${c.type})`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
