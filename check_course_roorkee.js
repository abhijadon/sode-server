const mongoose = require("mongoose");
const { Course } = require("./src/model/Course");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  const courses = await Course.find({}).select("title slug universityOfferings.university").lean();
  const roorkeeCourses = courses.filter(c => {
     if (c.title.toLowerCase().includes("roorkee") || c.slug.toLowerCase().includes("roorkee")) return true;
     return c.universityOfferings.some(u => String(u.university) === "6a6b1ba4d930f59045882651"); // from earlier check
  });
  console.log("Roorkee courses:", JSON.stringify(roorkeeCourses, null, 2));
  process.exit(0);
}
run();
