const mongoose = require("mongoose");
const CourseController = require("./src/controller/course/course.controller");
const { buildCourseFilter } = require("./src/controller/course/course.filter");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  try {
    const request = { query: { category: "iit", subcategory: "iit-delhi" } };
    await buildCourseFilter(request, {});
    const reply = {
      code: function(c) { this.statusCode = c; return this; },
      send: (res) => {
        console.log("Status Code:", this.statusCode);
        console.log("Response payload:", JSON.stringify(res, null, 2));
      }
    };
    await CourseController.getWebsiteCourses(request, reply);
  } catch (err) {
    console.error("Outer Crash:", err.stack);
  }
  process.exit(0);
}
run();
