const mongoose = require("mongoose");
const CourseController = require("./src/controller/course/course.controller");
const { buildCourseFilter } = require("./src/controller/course/course.filter");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  try {
    const request = { query: { category: "certification", subcategory: "ai-courses" } };
    await buildCourseFilter(request, {});
    const reply = {
      code: function(c) { this.statusCode = c; return this; },
      send: (res) => {
        console.log("Success! Data length:", res.data?.length);
      }
    };
    await CourseController.getWebsiteCourses(request, reply);
  } catch (err) {
    console.error("Crash during test:", err.stack);
  }
  process.exit(0);
}
run();
