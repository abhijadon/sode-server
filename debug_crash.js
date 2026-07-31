const mongoose = require("mongoose");
const { buildCourseFilter } = require("./src/controller/course/course.filter");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  try {
    const request = { query: { category: "certification", subcategory: "browse-ai-courses" } };
    await buildCourseFilter(request, {});
    console.log("Filter Built:", JSON.stringify(request.courseFilter, null, 2));
  } catch (err) {
    console.error("Crash!", err);
  }
  process.exit(0);
}
run();
