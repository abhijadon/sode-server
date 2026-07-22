"use strict";

/**
 * Seed Ratings — No user dependency
 * Inserts all reviews directly from REVIEW_POOL.
 *
 * Run: node src/seed/seedRatings.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const { Rating } = require("../model/Rating");

// ─── Review Pool ──────────────────────────────────────────────────────────────

const REVIEW_POOL = [
  {
    rating: 5,
    title: "Life-changing experience",
    review:
      "SODE helped me find the perfect executive program that matched my career goals. The platform is incredibly well-organised and the counselling support was top-notch. Highly recommend to any working professional.",
  },
  {
    rating: 4.5,
    title: "Excellent platform for working professionals",
    review:
      "The course filtering and comparison features saved me so much time. I was able to compare multiple universities side by side and make an informed decision. The process was smooth from enquiry to enrolment.",
  },
  {
    rating: 5,
    title: "Best decision I made for my career",
    review:
      "I enrolled in an online MBA through SODE and it has completely transformed my professional journey. The team guided me at every step and the university they recommended was a perfect fit.",
  },
  {
    rating: 4,
    title: "Very helpful and informative",
    review:
      "Great platform with detailed information about each university and program. The comparison tool is very useful. Support team responded quickly to all my queries. Would have given 5 stars if the mobile experience was a bit smoother.",
  },
  {
    rating: 4.5,
    title: "Trusted and reliable",
    review:
      "SODE made it very easy to explore and compare executive education options. All the universities listed are properly verified and accredited. The enrollment process was transparent with no hidden charges.",
  },
  {
    rating: 3.5,
    title: "Good but scope for improvement",
    review:
      "Overall a useful platform to explore executive programs. The database of courses is good. However, I felt the search filters could be more granular. Customer support was helpful but response time could improve.",
  },
  {
    rating: 5,
    title: "Smooth enrollment experience",
    review:
      "From choosing the program to completing the admission process, SODE team was with me throughout. They answered every question promptly and made the whole journey stress-free. Very professional.",
  },
  {
    rating: 4,
    title: "Great variety of programs",
    review:
      "I was impressed by the variety of programs available — from global MBA programs to Indian UGC-DEB approved degrees. The detailed program descriptions helped me make the right choice for my profile.",
  },
  {
    rating: 5,
    title: "Highly recommended for professionals",
    review:
      "As a working professional with limited time, SODE made it very simple to explore my options. The counsellors understood my schedule and career aspirations and gave me spot-on recommendations.",
  },
  {
    rating: 4.5,
    title: "Premium experience throughout",
    review:
      "The platform feels very premium and easy to use. University profiles are well-detailed with all the info I needed. Brochure downloads, fee info, and application links — everything is in one place.",
  },
  {
    rating: 5,
    title: "Helped me upgrade my career",
    review:
      "I was looking for a DBA program and SODE showed me options I had never heard of. Rushford Business School was the perfect pick for me. The entire process was smooth and the SODE team was very supportive.",
  },
  {
    rating: 4,
    title: "Good platform, great support",
    review:
      "The counselling support was excellent. They helped me narrow down the right program based on my experience and budget. The website is clean and easy to navigate. Would love to see more Indian universities listed.",
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seedRatings() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/sode";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log("🌱 Seeding Ratings...");

    // Skip if already seeded
    const existing = await Rating.countDocuments({ removed: false });
    if (existing >= REVIEW_POOL.length) {
      console.log(`✅ Already seeded (${existing} ratings found). Skipping.`);
      return;
    }

    // Clear existing and re-seed fresh
    await Rating.deleteMany({});
    console.log("🗑️  Cleared old ratings");

    const docs = REVIEW_POOL.map((r) => ({
      rating:             r.rating,
      title:              r.title,
      review:             r.review,
      status:             "approved",
      isVerifiedPurchase: true,
      enabled:            true,
      removed:            false,
    }));

    await Rating.insertMany(docs);

    console.log(`\n🎉 Done! Inserted ${docs.length} ratings`);
  } catch (error) {
    console.error("❌ Error seeding Ratings:", error.message);
  }
}

// Run directly
if (require.main === module) {
  seedRatings().then(() => mongoose.connection.close());
}

module.exports = { seedRatings };
