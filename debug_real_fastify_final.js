const mongoose = require("mongoose");
const CourseController = require("./src/controller/course/course.controller");
const { buildCourseFilter } = require("./src/controller/course/course.filter");
require("./src/model/Media");
require("./src/model/Category");
require("./src/model/University");
require("./src/model/Course");
require("./src/model/Tenant");
require("./src/model/Subcourse");
require("./src/model/Workspace");
require("./src/model/Fee");
require("./src/model/Duration");
require("./src/model/Institute");
require("./src/model/Program");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  try {
    const request = { query: { category: "iit", subcategory: "iit-delhi" } };
    await buildCourseFilter(request, {});
    const reply = {
      code: function(c) { this.statusCode = c; return this; },
      send: (res) => {
        console.log("Full response:", JSON.stringify(res, null, 2));
      }
    };
    await CourseController.getWebsiteCourses(request, reply);
  } catch (err) {
    console.error("Crash:", err.stack);
  }
  process.exit(0);
}
run();
