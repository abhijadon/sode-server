const mongoose = require("mongoose");
require("dotenv").config();

async function checkIITDelhi() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const cat = await mongoose.connection.db.collection("categories").findOne({ slug: "iit-delhi" });
  console.log("IIT Delhi Category:", cat ? { _id: cat._id, name: cat.name, slug: cat.slug, parentId: cat.parentId } : "NOT FOUND");

  if (cat) {
    const courses = await mongoose.connection.db.collection("courses").find({ category: cat._id }).toArray();
    console.log("Courses with iit-delhi category:", courses.map(c => c.title));

    const partnerCourses = await mongoose.connection.db.collection("partnercourses").find({ category: cat._id }).toArray();
    console.log("PartnerCourses with iit-delhi category:", partnerCourses.map(pc => pc.title));
  }

  await mongoose.disconnect();
}

checkIITDelhi();
