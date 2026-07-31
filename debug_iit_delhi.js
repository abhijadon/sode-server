const mongoose = require("mongoose");
const { Course } = require("./src/model/Course");
const { Category } = require("./src/model/Category");
const { University } = require("./src/model/University");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  const iitCat = await Category.findOne({ slug: "iit" });
  console.log("IIT Category ID:", String(iitCat._id));
  
  const delhi = await University.findOne({ slug: "iit-delhi" });
  const course = await Course.findOne({ "universityOfferings.university": delhi._id }).lean();
  console.log("IIT Delhi Course Categories:", course.categories.map(c => String(c)));
  process.exit(0);
}
run();
