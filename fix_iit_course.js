const mongoose = require("mongoose");
const { Course } = require("./src/model/Course");
const { Category } = require("./src/model/Category");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  
  // Find IIT category
  const iitCat = await Category.findOne({ slug: "iit" });
  
  // Find course associated with IIT Roorkee
  const roorkeeCourse = await Course.findOne({ "universityOfferings.university": "6a6b1ba4d930f59045882651" });
  
  if (roorkeeCourse && iitCat) {
    if (!roorkeeCourse.categories) roorkeeCourse.categories = [];
    if (!roorkeeCourse.categories.includes(iitCat._id)) {
      roorkeeCourse.categories.push(iitCat._id);
      await roorkeeCourse.save();
      console.log("Added IIT category to IIT Roorkee course!");
    } else {
      console.log("IIT category already added to IIT Roorkee course!");
    }
  } else {
    console.log("Not found.");
  }
  process.exit(0);
}
run();
