require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');

async function run() {
  try {
    require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
    await mongoose.connect(process.env.DATABASE_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
    const Course = require('../model/Course').Course;
    const Uni = require('../model/University').University;
    
    const opj = await Uni.findOne({ name: /Jindal/i });
    if (!opj) { console.log("OPJ not found"); return process.exit(0); }
    
    const courses = await Course.find({ "universityOfferings.university": opj._id }).lean();
    console.log(`Found ${courses.length} courses for OPJ`);
    
    courses.forEach(c => {
      console.log(`Course: ${c.title}`);
      const off = c.universityOfferings.find(o => o.university.toString() === opj._id.toString());
      if (off) {
        off.subcourses.forEach(sc => {
          console.log(` - Subcourse: ${sc.title}`);
        });
      }
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
