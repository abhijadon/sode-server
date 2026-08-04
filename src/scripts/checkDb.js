const mongoose = require("mongoose");
const { Category } = require("../model/Category");
const { University } = require("../model/University");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  const cats = await Category.find({ slug: { $in: ["iit", "roorkee"] } }).lean();
  console.log("Categories:", cats);
  const unis = await University.find({ slug: { $in: ["iit", "roorkee", "iit-roorkee"] } }).lean();
  console.log("Universities:", unis);
  process.exit(0);
}
run();
