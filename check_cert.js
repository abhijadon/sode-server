const mongoose = require("mongoose");
const { Category } = require("./src/model/Category");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  const cats = await Category.find({ slug: /cert/i }).lean();
  console.log("Categories with cert:", cats.map(c => c.name));
  process.exit(0);
}
run();
