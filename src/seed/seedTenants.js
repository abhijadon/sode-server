"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Tenant } = require("../model/Tenant");

const tenants = [
  {
    name: "upGrad",
    slug: "upgrad",
    logo: "http://172.236.183.64:9000/images/2026/07/20/407d5f15db5b155bbaf4ea57cbb19e1a.png",
    description: "India's largest online higher education company providing industry-relevant programs.",
    website: "https://www.upgrad.com",
    email: "contact@upgrad.com",
    phone: "+91 1800 210 2020",
    address: "Nishuvi, 75 Dr. Annie Besant Road, Worli",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400018",
    enabled: true,
    removed: false,
  },
  {
    name: "Simplilearn",
    slug: "simplilearn",
    logo: "https://www.simplilearn.com/ice9/assets/logo.png",
    description: "World's #1 online bootcamp for digital economy skills training.",
    website: "https://www.simplilearn.com",
    email: "support@simplilearn.com",
    phone: "+91 1800 102 9688",
    address: "Nalapad Brigade Centre, 134, LB Shastri Nagar",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    pincode: "560017",
    enabled: true,
    removed: false,
  },
  {
    name: "Great Learning",
    slug: "great-learning",
    logo: "https://d1vwxdpzbgdqj.cloudfront.net/images/gl-logo.png",
    description: "Leading global edtech company for professional and higher education.",
    website: "https://www.mygreatlearning.com",
    email: "info@greatlearning.in",
    phone: "+91 080 4718 9251",
    address: "ORR, Marathahalli - Sarjapur Outer Ring Rd",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    pincode: "560103",
    enabled: true,
    removed: false,
  },
  {
    name: "College Vidya",
    slug: "college-vidya",
    logo: "https://collegevidya.com/static/media/logo.png",
    description: "Unbiased online and distance university comparison portal.",
    website: "https://collegevidya.com",
    email: "support@collegevidya.com",
    phone: "+91 1800 420 5757",
    address: "Noida Sector 63, Block H",
    city: "Noida",
    state: "Uttar Pradesh",
    country: "India",
    pincode: "201301",
    enabled: true,
    removed: false,
  },
  {
    name: "Coursera",
    slug: "coursera",
    logo: "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera.org/share/coursera-logo.png",
    description: "Global online learning platform offering courses and degrees from top universities.",
    website: "https://www.coursera.org",
    email: "contact@coursera.org",
    phone: "+1 800 952 5210",
    address: "381 E Evelyn Ave",
    city: "Mountain View",
    state: "California",
    country: "United States",
    pincode: "94041",
    enabled: true,
    removed: false,
  },
];

async function seedTenants() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB for seeding tenants");
    }

    for (const t of tenants) {
      const tenant = await Tenant.findOneAndUpdate(
        { slug: t.slug },
        t,
        { upsert: true, returnDocument: "after" }
      );
      console.log(`✅ Tenant '${tenant.name}' (${tenant.slug}) seeded successfully [ID: ${tenant._id}]`);
    }

    console.log("🎉 Tenants dummy data seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding tenants:", error);
  } finally {
    if (require.main === module) {
      await mongoose.disconnect();
    }
  }
}

if (require.main === module) {
  seedTenants();
}

module.exports = seedTenants;
