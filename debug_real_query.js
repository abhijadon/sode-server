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
        console.log("Programs length:", res.result?.programs?.length);
        console.log("Total count:", res.result?.total);
        if (res.result?.programs?.length > 0) {
           console.log("First program title:", res.result.programs[0].title);
        } else {
           console.log("Filter was:", JSON.stringify(request.courseFilter, null, 2));
        }
      }
    };
    await CourseController.getWebsiteCourses(request, reply);
  } catch (err) {
    console.error("Crash:", err.stack);
  }
  process.exit(0);
}
run();
