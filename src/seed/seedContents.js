"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Content } = require("../model/Content");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

const sampleContents = [
  {
    title: "About SODE",
    slug: "about-us",
    contentType: "page",
    summary: "Learn more about SODE, our educational vision, and how we bring top executive certifications to your fingertips.",
    content: "About SODE (School of Digital Education)\n\nAt SODE, we bridge the gap between academic theory and practical industry requirements. We partner with premier institutes such as Indian Institutes of Management (IIMs) and Indian Institutes of Technology (IITs) to deliver industry-recognized executive diplomas and certification programs.\n\nOur virtual classroom offers 2-way interactive live sessions, weekend batch flexibilities, zero cost EMI plans, and 1:1 personal mentorship from industry leaders.",
    metaTitle: "About Us | SODE Executive Education Portal",
    metaDescription: "Learn about SODE, our mission, and high-impact career acceleration programs with IIM & IIT partners.",
    metaKeywords: ["about sode", "executive education", "iim certifications", "iit diplomas"],
    sortOrder: 1,
    enabled: true,
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    contentType: "policy",
    summary: "Read our privacy guidelines, user data protection policies, and details on how we secure your personal data.",
    content: "SODE Privacy Policy\n\nYour privacy is important to us. This privacy statement explains the personal data SODE processes, how we process it, and for what purposes.\n\nWe collect information such as name, email address, mobile number, and work details during registrations. SODE does not sell or distribute your private information to third-party marketing networks.",
    metaTitle: "Privacy Policy | SODE",
    metaDescription: "Read the Privacy Policy of SODE. Understand how we collect, store, and safeguard your data.",
    metaKeywords: ["privacy policy", "data safety", "user details"],
    sortOrder: 2,
    enabled: true,
  },
  {
    title: "Terms and Conditions",
    slug: "terms-conditions",
    contentType: "policy",
    summary: "General terms, service guidelines, student rules, and cancellation conditions of our certification platform.",
    content: "Terms & Conditions\n\nWelcome to SODE. These terms and conditions outline the rules and regulations for the use of SODE's website and student portal services.\n\nBy accessing this website, we assume you accept these terms and conditions. Do not continue to use SODE if you do not agree to take all of the terms and conditions stated on this page.",
    metaTitle: "Terms & Conditions of Service | SODE",
    metaDescription: "Read the SODE terms of service, student policies, and usage guidelines.",
    metaKeywords: ["terms and conditions", "terms of service", "legal terms"],
    sortOrder: 3,
    enabled: true,
  },
  {
    title: "Refund and Cancellation Policy",
    slug: "refund-policy",
    contentType: "policy",
    summary: "Detailed criteria and guidelines for program cancellation refunds and batch change request models.",
    content: "Refund & Cancellation Policy\n\nWe strive to deliver top-tier education experiences. If you wish to cancel your registration, requests must be submitted within 7 days of program commencement to be eligible for a refund.\n\nProcessing fees and taxes may be non-refundable. Batch change requests are permitted subject to approvals from the partner university.",
    metaTitle: "Refund Policy | SODE",
    metaDescription: "Understand SODE cancellation terms, fee refund policies, and batch transfer guidelines.",
    metaKeywords: ["refund policy", "cancellation", "fees return"],
    sortOrder: 4,
    enabled: true,
  }
];

async function seedDefaultContents() {
  try {
    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("🔄 Upserting sample Content pages (Plain Text format)...");
    let addedCount = 0;
    
    for (const item of sampleContents) {
      await Content.findOneAndUpdate(
        { slug: item.slug },
        { $set: item },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
      console.log(`✅ Synced content page: ${item.title} (/${item.slug})`);
      addedCount++;
    }

    console.log(`🎉 Done! All ${addedCount} content pages successfully synced as plain text!`);
  } catch (error) {
    console.error("❌ Error seeding content pages:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedDefaultContents();
