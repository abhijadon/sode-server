const mongoose = require("mongoose");
const { Category } = require("./src/model/Category");
const { University } = require("./src/model/University");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  const cats = await Category.find({ slug: /iit/i }).lean();
  console.log("Categories with IIT:", cats.map(c => c.name));
  
  const unis = await University.find({ slug: /iit/i }).lean();
  console.log("Universities with IIT:", unis.map(u => ({ name: u.name, slug: u.slug })));
  process.exit(0);
}
run();
