"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Media } = require("../model/Media");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    const mediaList = await Media.find({}).limit(50).lean();
    console.log("Total media count:", await Media.countDocuments({}));
    console.log("Sample Media URLs:");
    mediaList.forEach(m => {
      console.log(`- name: ${m.name}, url: ${m.url}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
