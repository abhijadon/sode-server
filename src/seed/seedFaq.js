"use strict";

const mongoose = require("mongoose");
require("dotenv").config();
const { Faq } = require("../model/Faq");

const faqSeedData = [
  {
    question: "Are the degrees and certificates from these programs globally recognised?",
    answer: "Yes. All programs of Top International Global Universities that are offered through SODE are from accredited institutions such as WES-recognised, AACSB-accredited, or approved by British/Swiss/US agencies, ensuring global validity.",
    category: "general",
    order: 1,
    enabled: true,
    removed: false,
  },
  {
    question: "What documents are typically required during the application process?",
    answer: "Professionals are required to have a structured document set of 10th and 12th marksheets, Bachelors degree certificate/marksheets, and Master's degree certificate/marksheets. Also, they need to have valid identity proofs, such as an Aadhaar Card and a PAN Card, for verification purposes. Candidates applying for programmes with work experience criteria must also provide an experience letter. A recent passport-size photograph is required to complete the application and enrollment process.",
    category: "general",
    order: 2,
    enabled: true,
    removed: false,
  },
  {
    question: "Is there an entrance exam required to enrol in any executive educational programs?",
    answer: "No, there is no entrance exam required for executive educational programs . Applicants can enrol easily having bachelors and masters degree, and some programs require prior work experience.",
    category: "general",
    order: 3,
    enabled: true,
    removed: false,
  },
  {
    question: "Are there any scholarships available for programs listed on SODE?",
    answer: "Yes, SODE offers flexible financing options where aspirants can enrol with NO cost EMI. As per the course duration, they can easily balance and divide it per month.",
    category: "general",
    order: 4,
    enabled: true,
    removed: false,
  },
  {
    question: "Are these degrees valid in India and internationally?",
    answer: "Yes. All university partners listed on SODE include international universities like Golden Gate University, which is WES & AACSB accredited, Rushford Business School is QS 5-star rated, and Edgewood, which holds ACBSP accreditation, making them globally excellent. Indian institutions like IIMs and IITs are government-recognised under UGC norms.",
    category: "general",
    order: 5,
    enabled: true,
    removed: false,
  },
  {
    question: "What is the minimum work experience required to enrol in Executive Management Programs & Certification Courses?",
    answer: "SODE offers a diverse portfolio of executive management programmes and certifications designed to equip professionals with technological skills powered by Data science, AI, and ML needed for upskilling. Most Executive Management Programs and Certification Courses require candidates to have a minimum of 3 years of professional work experience, although eligibility criteria may vary depending on the programme and partnering university.",
    category: "general",
    order: 6,
    enabled: true,
    removed: false,
  },
];

async function seedFaqs() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/sode";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log("🌱 Seeding FAQs into Database...");

    for (const item of faqSeedData) {
      await Faq.findOneAndUpdate(
        { question: item.question },
        item,
        { upsert: true, new: true }
      );
    }

    console.log(`✅ Successfully seeded ${faqSeedData.length} FAQs!`);
  } catch (error) {
    console.error("❌ Error seeding FAQs:", error);
  }
}

if (require.main === module) {
  seedFaqs().then(() => mongoose.connection.close());
}

module.exports = { seedFaqs };
