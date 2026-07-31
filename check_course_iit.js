const mongoose = require("mongoose");
const { Course } = require("./src/model/Course");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  const courses = await Course.find({}).select("title slug categories universityOfferings.category").lean();
  console.log("Total courses:", courses.length);
  const iitCourses = courses.filter(c => 
    c.title.toLowerCase().includes("iit") || 
    c.slug.toLowerCase().includes("iit")
  );
  console.log("IIT related courses:", JSON.stringify(iitCourses, null, 2));
  process.exit(0);
}
run();
