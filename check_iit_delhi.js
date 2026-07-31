const mongoose = require("mongoose");
const { Course } = require("./src/model/Course");
const { University } = require("./src/model/University");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  const delhi = await University.findOne({ slug: "iit-delhi" });
  if (!delhi) return console.log("IIT Delhi not found");
  
  const courses = await Course.find({ "universityOfferings.university": delhi._id }).lean();
  console.log("IIT Delhi courses:", courses.length, courses.map(c => c.title));
  process.exit(0);
}
run();
