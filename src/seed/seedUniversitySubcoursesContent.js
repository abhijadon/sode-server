"use strict";

const mongoose = require("mongoose");
require("dotenv").config();

const { Course } = require("../model/Course");
const { Subcourse } = require("../model/Subcourse");
const { Fee } = require("../model/Fee");
const { Duration } = require("../model/Duration");
const { Eligibility } = require("../model/Eligibility");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sode";

const sampleContentBySlug = {
  finance: {
    title: "Finance & Corporate Valuation",
    shortDescription: "Master corporate finance, mergers & acquisitions, and financial analysis.",
    content: "Designed for ambitious finance leaders and executives. This specialization covers advanced financial modeling, strategic asset allocation, capital budgeting, risk management, and international corporate finance with practical case studies.",
    modules: [
      { title: "Advanced Corporate Finance", description: "Capital structure, valuation techniques, and dividend policy" },
      { title: "Mergers & Acquisitions", description: "Deal structuring, due diligence, and post-merger integration" },
      { title: "Financial Risk & Derivatives", description: "Managing market risks with futures, options, and swaps" },
    ],
  },
  "operations-and-supply-chain": {
    title: "Operations & Supply Chain Strategy",
    shortDescription: "Optimize global supply chains, logistics, and lean operations.",
    content: "Focuses on building resilient end-to-end supply chains, inventory optimization, procurement strategies, and industry 4.0 digitisation in logistics to drive organizational efficiency.",
    modules: [
      { title: "Global Logistics & Freight", description: "Supply chain network design and international freight" },
      { title: "Lean Operations & Six Sigma", description: "Process optimization, quality control, and waste reduction" },
      { title: "Digital Supply Chain Technologies", description: "IoT, AI forecasting, and blockchain in supply chain" },
    ],
  },
  "ai-and-technology": {
    title: "AI & Technology Management",
    shortDescription: "Lead digital transformation and AI strategy for enterprise growth.",
    content: "Prepares tech managers to bridge technical innovation with business strategy. Master generative AI application, cloud architecture governance, data science leadership, and tech product management.",
    modules: [
      { title: "Generative AI for Executives", description: "Leveraging LLMs and predictive models for business" },
      { title: "Cloud & Enterprise Architecture", description: "Scalable cloud infrastructures and cybersecurity governance" },
      { title: "Data-Driven Strategy", description: "Transforming big data into actionable strategic insights" },
    ],
  },
  general: {
    title: "General Management & Leadership",
    shortDescription: "Develop holistic general management and strategic decision-making skills.",
    content: "A comprehensive executive program providing 360-degree business acumen across strategy, marketing, leadership, operational excellence, and corporate governance for senior leadership roles.",
    modules: [
      { title: "Strategic Leadership & Vision", description: "Leading high-performance teams and change management" },
      { title: "Global Business Strategy", description: "Navigating international markets and competitive dynamics" },
      { title: "Managerial Economics", description: "Pricing strategies and market analysis" },
    ],
  },
};

const fallbackContent = {
  shortDescription: "Comprehensive executive specialization program for strategic career growth.",
  content: "This specialization offers in-depth domain knowledge, interactive case studies with experienced faculty, industry-relevant projects, and leadership skills engineered to accelerate your executive career.",
  modules: [
    { title: "Module 1: Strategic Foundations", description: "Core concepts and framework mastery" },
    { title: "Module 2: Advanced Executive Practices", description: "Applied industry case studies and strategic execution" },
    { title: "Module 3: Capstone Project", description: "Hands-on real world problem solving and certification" },
  ],
};

async function seedUniversitySubcoursesContent() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);

    const [courses, subcourses, fees, durations, eligibilities] = await Promise.all([
      Course.find({}),
      Subcourse.find({}),
      Fee.find({}),
      Duration.find({}),
      Eligibility.find({}),
    ]);

    console.log(`Found ${courses.length} courses and ${subcourses.length} subcourses.`);

    const feeId = fees.length > 0 ? fees[0]._id : null;
    const durationId = durations.length > 0 ? durations[0]._id : null;
    const eligibilityId = eligibilities.length > 0 ? eligibilities[0]._id : null;

    let updatedCount = 0;

    for (const course of courses) {
      let modified = false;

      if (Array.isArray(course.universityOfferings) && course.universityOfferings.length > 0) {
        for (const offering of course.universityOfferings) {
          // Read raw subcourse ObjectIds from BSON or current subcourses sub-documents
          const rawSubIds = Array.isArray(offering.subcourse) && offering.subcourse.length > 0
            ? offering.subcourse
            : (Array.isArray(offering.subcourses) && offering.subcourses.length > 0
              ? offering.subcourses.map(s => (s.subcourse?._id || s.subcourse || s._id))
              : []);

          const seenSubIds = new Set();
          const newSubcoursesList = [];

          for (const subItem of rawSubIds) {
            const strId = typeof subItem === "object" && subItem !== null
              ? String(subItem._id || subItem.id || "")
              : String(subItem || "");

            if (!strId || seenSubIds.has(strId)) continue;
            seenSubIds.add(strId);

            const subObj = subcourses.find((s) => String(s._id) === strId);
            const subSlug = subObj?.slug || (subObj?.title ? subObj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "general");
            const subTitle = subObj?.title || subObj?.name || "Specialization";

            const template = sampleContentBySlug[subSlug] || {
              title: subTitle,
              shortDescription: fallbackContent.shortDescription,
              content: fallbackContent.content,
              modules: fallbackContent.modules,
            };

            newSubcoursesList.push({
              subcourse: subObj?._id || strId,
              title: template.title || subTitle,
              shortDescription: template.shortDescription,
              content: template.content,
              description: template.content,
              fee: offering.fee || feeId,
              duration: offering.duration || durationId,
              eligibility: offering.eligibility || eligibilityId,
              modules: template.modules,
              enabled: true,
            });
          }

          offering.subcourses = newSubcoursesList;
          modified = true;
        }
      }

      if (modified) {
        course.markModified("universityOfferings");
        await course.save();
        updatedCount++;
      }
    }

    // Completely unset legacy subcourse field from MongoDB collection
    console.log("Unsetting legacy subcourse field from all MongoDB documents...");
    await Course.collection.updateMany(
      {},
      { $unset: { "universityOfferings.$[].subcourse": "" } }
    );

    console.log(`Successfully updated ${updatedCount} Course documents and removed legacy subcourse field from MongoDB!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding university subcourses content:", error);
    process.exit(1);
  }
}

seedUniversitySubcoursesContent();
