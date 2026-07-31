const mongoose = require("mongoose");
const CourseController = require("./src/controller/course/course.controller");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  try {
    const request = { 
      query: { category: "certification", subcategory: "ai-courses" },
      courseFilter: { partnerFilter: { removed: false, enabled: true }, mSort: { createdAt: -1 }, limitNum: 0, skipNum: 0 }
    };
    const reply = {
      code: function(c) { this.statusCode = c; return this; },
      send: (res) => {
        console.log("Success! Data length:", res.data?.length);
      }
    };
    await CourseController.getWebsiteCourses(request, reply);
  } catch (err) {
    console.error("Crash during getWebsiteCourses:", err.stack);
  }
  process.exit(0);
}
run();
