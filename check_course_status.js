const mongoose = require("mongoose");
const { Course } = require("./src/model/Course");
const { University } = require("./src/model/University");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  const delhi = await University.findOne({ slug: "iit-delhi" });
  const course = await Course.findOne({ "universityOfferings.university": delhi._id }).lean();
  console.log("Course status:", JSON.stringify({
    title: course.title,
    removed: course.removed,
    enabled: course.enabled,
    categories: course.categories
  }, null, 2));
  process.exit(0);
}
run();
