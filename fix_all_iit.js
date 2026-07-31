const mongoose = require("mongoose");
const { Course } = require("./src/model/Course");
const { Category } = require("./src/model/Category");
const { University } = require("./src/model/University");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  
  const iitCat = await Category.findOne({ slug: "iit" });
  if (!iitCat) return console.log("No IIT category found");
  
  const iitUnis = await University.find({ slug: /iit/i });
  const iitUniIds = iitUnis.map(u => String(u._id));
  
  const courses = await Course.find({ 
    "universityOfferings.university": { $in: iitUniIds }
  });
  
  let count = 0;
  for (const c of courses) {
    if (!c.categories) c.categories = [];
    if (!c.categories.includes(iitCat._id)) {
      c.categories.push(iitCat._id);
      await c.save();
      count++;
    }
  }
  console.log(`Linked IIT category to ${count} courses across IIT universities!`);
  process.exit(0);
}
run();
