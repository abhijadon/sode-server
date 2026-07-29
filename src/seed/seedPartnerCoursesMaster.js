"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Course } = require("../model/Course");
const { University } = require("../model/University");
const { Category } = require("../model/Category");
const { Fee } = require("../model/Fee");
const { Duration } = require("../model/Duration");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const master75Rows = [
  { rootCat: "Global Universities", uniName: "Edgewood University", degreeLevel: "Doctorate", courseTitle: "DBA - General", domainCat: "Management", feeAmount: 950000, durationStr: "24 months" },
  { rootCat: "Global Universities", uniName: "Edgewood University", degreeLevel: "Doctorate", courseTitle: "DBA - Finance", domainCat: "Finance", feeAmount: 950001, durationStr: "25 months" },
  { rootCat: "Global Universities", uniName: "Edgewood University", degreeLevel: "Doctorate", courseTitle: "DBA - Leadership", domainCat: "Leadership", feeAmount: 950002, durationStr: "26 months" },
  { rootCat: "Global Universities", uniName: "Edgewood University", degreeLevel: "Master + Doctorate (Dual)", courseTitle: "MBA + DBA - Finance", domainCat: "Finance", feeAmount: 1170000, durationStr: "30 months" },
  { rootCat: "Global Universities", uniName: "Edgewood University", degreeLevel: "Master + Doctorate (Dual)", courseTitle: "MBA + DBA - Leadership", domainCat: "Leadership", feeAmount: 1170000, durationStr: "30 months" },
  { rootCat: "Global Universities", uniName: "ESGCI", degreeLevel: "Doctorate", courseTitle: "Online DBA (Doctor of Business Administration)", domainCat: "Management", feeAmount: 715000, durationStr: "24 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - General", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - International Business", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Healthcare Management", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Human Resource Management", domainCat: "HR", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Supply Chain Management", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Finance", domainCat: "Finance", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Data Science", domainCat: "Data Science", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Marketing", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Business Analytics", domainCat: "Data Science", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Clinical Research", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Quality Management", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Accounting", domainCat: "Finance", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Information Technology", domainCat: "IT", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Master Degree", courseTitle: "MSc - Higher European Degree", domainCat: "Management", feeAmount: 325000, durationStr: "12 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Master Degree", courseTitle: "MSc - Clinical Research", domainCat: "Management", feeAmount: 325000, durationStr: "12 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Master Degree", courseTitle: "MSc - Health Economics", domainCat: "Management", feeAmount: 325000, durationStr: "12 months" },
  { rootCat: "Global Universities", uniName: "AURA International School of Management", degreeLevel: "Master Degree", courseTitle: "Online Masters in Data Science", domainCat: "Data Science", feeAmount: 250000, durationStr: "12 months" },
  { rootCat: "Global Universities", uniName: "AURA International School of Management", degreeLevel: "Master Degree", courseTitle: "Online Masters in Artificial Intelligence", domainCat: "AI", feeAmount: 250000, durationStr: "12 months" },
  { rootCat: "Global Universities", uniName: "AURA International School of Management", degreeLevel: "Executive PG", courseTitle: "Online Executive Masters in Cybersecurity", domainCat: "IT", feeAmount: 250000, durationStr: "12 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "Online Global DBA", domainCat: "Management", feeAmount: 850000, durationStr: "24 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "Online Executive DBA", domainCat: "Leadership", feeAmount: 990000, durationStr: "24 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Executive PG", courseTitle: "Executive MBA", domainCat: "Management", feeAmount: 450000, durationStr: "12 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Master Degree", courseTitle: "Master of Science in Business Analytics (MSBA)", domainCat: "Data Science", feeAmount: 1050000, durationStr: "15 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Doctorate", courseTitle: "Doctor of Business Administration (DBA)", domainCat: "Management", feeAmount: 1350000, durationStr: "36 months" },
  { rootCat: "IIM Courses", uniName: "IIM Ahmedabad", degreeLevel: "Executive PG", courseTitle: "Senior Management Programme (SMP)", domainCat: "Leadership", feeAmount: 825000, durationStr: "12 months" },
  { rootCat: "IIM Courses", uniName: "IIM Ahmedabad", degreeLevel: "Executive PG", courseTitle: "Chief Technology Officer Programme (CTO)", domainCat: "Technology", feeAmount: 950000, durationStr: "12 months" },
  { rootCat: "IIM Courses", uniName: "IIM Kozhikode", degreeLevel: "Executive PG", courseTitle: "Executive Post Graduate Programme in Management (EPGP)", domainCat: "Management", feeAmount: 1400000, durationStr: "24 months" },
  { rootCat: "IIM Courses", uniName: "IIM Kozhikode", degreeLevel: "Executive PG", courseTitle: "Senior Management Programme (SMP)", domainCat: "Leadership", feeAmount: 650000, durationStr: "12 months" },
  { rootCat: "IIM Courses", uniName: "IIM Kozhikode", degreeLevel: "Executive Certificate", courseTitle: "Professional Certificate Programme in Data Science", domainCat: "Data Science", feeAmount: 225000, durationStr: "8 months" },
  { rootCat: "IIM Courses", uniName: "IIM Calcutta", degreeLevel: "Executive PG", courseTitle: "Executive Programme in Business Analytics (EPBA)", domainCat: "Data Science", feeAmount: 680000, durationStr: "12 months" },
  { rootCat: "IIM Courses", uniName: "IIM Calcutta", degreeLevel: "Executive Certificate", courseTitle: "Executive Programme in Leadership & Management (EPLM)", domainCat: "Leadership", feeAmount: 590000, durationStr: "12 months" },
  { rootCat: "IIM Courses", uniName: "IIM Lucknow", degreeLevel: "Executive Certificate", courseTitle: "Executive Programme in Data Science & AI", domainCat: "AI", feeAmount: 295000, durationStr: "9 months" },
  { rootCat: "IIM Courses", uniName: "IIM Lucknow", degreeLevel: "Executive Certificate", courseTitle: "Executive Programme in Finance for Senior Executives", domainCat: "Finance", feeAmount: 340000, durationStr: "9 months" },
  { rootCat: "IIM Courses", uniName: "IIM Indore", degreeLevel: "Executive Certificate", courseTitle: "Post Graduate Certificate Programme in Management (PGCPM)", domainCat: "Management", feeAmount: 420000, durationStr: "12 months" },
  { rootCat: "Top IIT Courses", uniName: "IIT Delhi", degreeLevel: "Executive Certificate", courseTitle: "Certificate Programme in Data Science & Machine Learning", domainCat: "Data Science", feeAmount: 165000, durationStr: "6 months" },
  { rootCat: "Top IIT Courses", uniName: "IIT Delhi", degreeLevel: "Executive Certificate", courseTitle: "Executive Programme in Supply Chain & Operations", domainCat: "Operations", feeAmount: 185000, durationStr: "6 months" },
  { rootCat: "Top IIT Courses", uniName: "IIT Bombay", degreeLevel: "Executive Certificate", courseTitle: "Certificate Programme in Machine Learning & AI", domainCat: "AI", feeAmount: 210000, durationStr: "8 months" },
  { rootCat: "Top IIT Courses", uniName: "IIT Madras", degreeLevel: "Bachelor Degree", courseTitle: "BS Degree in Data Science & Applications", domainCat: "Data Science", feeAmount: 345000, durationStr: "36 months" },
  { rootCat: "Top IIT Courses", uniName: "IIT Roorkee", degreeLevel: "Executive Certificate", courseTitle: "Advanced Certificate in Full Stack Software Development", domainCat: "Software", feeAmount: 150000, durationStr: "10 months" },
  { rootCat: "Executive Education", uniName: "ISB Hyderabad", degreeLevel: "Executive PG", courseTitle: "Post Graduate Programme in Management for Senior Executives (PGPMAX)", domainCat: "Leadership", feeAmount: 4200000, durationStr: "15 months" },
  { rootCat: "Executive Education", uniName: "ISB Hyderabad", degreeLevel: "Executive Certificate", courseTitle: "Advanced Management Programme in Business Analytics (AMPBA)", domainCat: "Data Science", feeAmount: 1050000, durationStr: "12 months" },
  { rootCat: "Executive Education", uniName: "XLRI Jamshedpur", degreeLevel: "Executive Certificate", courseTitle: "Post Graduate Certificate in Business Management (PGCBM)", domainCat: "Management", feeAmount: 400000, durationStr: "12 months" },
  { rootCat: "Executive Education", uniName: "XLRI Jamshedpur", degreeLevel: "Executive Certificate", courseTitle: "Post Graduate Certificate in Human Resource Management (PGCHRM)", domainCat: "HR", feeAmount: 400000, durationStr: "12 months" },
  { rootCat: "Executive Education", uniName: "SPJIMR Mumbai", degreeLevel: "Executive PG", courseTitle: "Post Graduate Executive Management Programme (PGEMP)", domainCat: "Management", feeAmount: 950000, durationStr: "21 months" },
  { rootCat: "Executive Education", uniName: "MDI Gurgaon", degreeLevel: "Executive PG", courseTitle: "Post Graduate Diploma in Management (PGDM - Executive)", domainCat: "Management", feeAmount: 1180000, durationStr: "18 months" },
  { rootCat: "Online Degree Courses", uniName: "Jain University Online", degreeLevel: "Master Degree", courseTitle: "Online Master of Business Administration (MBA)", domainCat: "Management", feeAmount: 150000, durationStr: "24 months" },
  { rootCat: "Online Degree Courses", uniName: "Jain University Online", degreeLevel: "Bachelor Degree", courseTitle: "Online Bachelor of Computer Applications (BCA)", domainCat: "IT", feeAmount: 120000, durationStr: "36 months" },
  { rootCat: "Online Degree Courses", uniName: "Jain University Online", degreeLevel: "Master Degree", courseTitle: "Online Master of Computer Applications (MCA)", domainCat: "IT", feeAmount: 140000, durationStr: "24 months" },
  { rootCat: "Online Degree Courses", uniName: "Manipal University Online", degreeLevel: "Master Degree", courseTitle: "Online Master of Business Administration (MBA)", domainCat: "Management", feeAmount: 175000, durationStr: "24 months" },
  { rootCat: "Online Degree Courses", uniName: "Manipal University Online", degreeLevel: "Bachelor Degree", courseTitle: "Online Bachelor of Business Administration (BBA)", domainCat: "Management", feeAmount: 135000, durationStr: "36 months" },
  { rootCat: "Online Degree Courses", uniName: "Manipal University Online", degreeLevel: "Master Degree", courseTitle: "Online Master of Commerce (M.Com)", domainCat: "Finance", feeAmount: 100000, durationStr: "24 months" },
  { rootCat: "Online Degree Courses", uniName: "Amity University Online", degreeLevel: "Master Degree", courseTitle: "Online Master of Business Administration (MBA)", domainCat: "Management", feeAmount: 199000, durationStr: "24 months" },
  { rootCat: "Online Degree Courses", uniName: "Amity University Online", degreeLevel: "Bachelor Degree", courseTitle: "Online Bachelor of Computer Applications (BCA)", domainCat: "IT", feeAmount: 145000, durationStr: "36 months" },
  { rootCat: "Online Degree Courses", uniName: "Amity University Online", degreeLevel: "Master Degree", courseTitle: "Online Master of Science in Data Science (M.Sc)", domainCat: "Data Science", feeAmount: 220000, durationStr: "24 months" },
  { rootCat: "Online Degree Courses", uniName: "Chandigarh University Online", degreeLevel: "Master Degree", courseTitle: "Online Master of Business Administration (MBA)", domainCat: "Management", feeAmount: 140000, durationStr: "24 months" },
  { rootCat: "Online Degree Courses", uniName: "Chandigarh University Online", degreeLevel: "Bachelor Degree", courseTitle: "Online Bachelor of Computer Applications (BCA)", domainCat: "IT", feeAmount: 110000, durationStr: "36 months" },
  { rootCat: "Online Degree Courses", uniName: "NMIMS Distance Learning", degreeLevel: "Master Degree", courseTitle: "Master of Business Administration (Distance MBA)", domainCat: "Management", feeAmount: 196000, durationStr: "24 months" },
  { rootCat: "Online Degree Courses", uniName: "NMIMS Distance Learning", degreeLevel: "Executive PG", courseTitle: "Post Graduate Diploma in Management (PGDM)", domainCat: "Management", feeAmount: 180000, durationStr: "24 months" },
  { rootCat: "Online Degree Courses", uniName: "LPU Online", degreeLevel: "Master Degree", courseTitle: "Online Master of Business Administration (MBA)", domainCat: "Management", feeAmount: 136000, durationStr: "24 months" },
  { rootCat: "Online Degree Courses", uniName: "LPU Online", degreeLevel: "Master Degree", courseTitle: "Online Master of Computer Applications (MCA)", domainCat: "IT", feeAmount: 128000, durationStr: "24 months" },
  { rootCat: "Certifications & Upskilling", uniName: "UpGrad Education", degreeLevel: "Executive PG", courseTitle: "Executive PG Diploma in Data Science", domainCat: "Data Science", feeAmount: 325000, durationStr: "12 months" },
  { rootCat: "Certifications & Upskilling", uniName: "UpGrad Education", degreeLevel: "Executive PG", courseTitle: "Executive PG Diploma in Full Stack Development", domainCat: "Software", feeAmount: 275000, durationStr: "11 months" },
  { rootCat: "Certifications & Upskilling", uniName: "Simplilearn", degreeLevel: "Executive Certificate", courseTitle: "Post Graduate Program in Data Science", domainCat: "Data Science", feeAmount: 215000, durationStr: "11 months" },
  { rootCat: "Certifications & Upskilling", uniName: "Simplilearn", degreeLevel: "Executive Certificate", courseTitle: "Post Graduate Program in Cloud Computing", domainCat: "Cloud", feeAmount: 195000, durationStr: "9 months" },
  { rootCat: "Certifications & Upskilling", uniName: "Great Learning", degreeLevel: "Executive PG", courseTitle: "PG Program in Artificial Intelligence & Machine Learning", domainCat: "AI", feeAmount: 325000, durationStr: "12 months" },
  { rootCat: "Certifications & Upskilling", uniName: "Great Learning", degreeLevel: "Executive PG", courseTitle: "PG Program in Management (Executive)", domainCat: "Management", feeAmount: 350000, durationStr: "12 months" },
  { rootCat: "Certifications & Upskilling", uniName: "INSEAD Online", degreeLevel: "Executive Certificate", courseTitle: "INSEAD Online Executive Leadership Programme", domainCat: "Leadership", feeAmount: 480000, durationStr: "6 months" },
  { rootCat: "Certifications & Upskilling", uniName: "Wharton Online", degreeLevel: "Executive Certificate", courseTitle: "Leadership & Management Certificate Program", domainCat: "Leadership", feeAmount: 390000, durationStr: "4 months" },
];

async function seedUnifiedCoursesMaster() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    console.log("🧹 Clearing existing Course collection...");
    await Course.deleteMany({});
    console.log("✨ Course collection cleared!");

    // Fetch lookups
    const universities = await University.find({});
    const categories = await Category.find({});
    const fees = await Fee.find({});
    const durations = await Duration.find({});

    console.log(`📊 Lookups: ${universities.length} Unis, ${categories.length} Cats, ${fees.length} Fees, ${durations.length} Durations.`);

    const uniMap = new Map();
    universities.forEach((u) => uniMap.set(u.slug, u._id));

    const catMap = new Map();
    categories.forEach((c) => catMap.set(c.slug, c._id));

    const feeMap = new Map();
    fees.forEach((f) => feeMap.set(f.amount, f._id));

    const durationMap = new Map();
    durations.forEach((d) => durationMap.set(d.slug, d._id));

    let order = 1;
    for (const row of master75Rows) {
      const uniSlug = slugify(row.uniName);
      const uniId = uniMap.get(uniSlug) || null;

      const degreeSlug = slugify(row.degreeLevel);
      const degreeCatId = catMap.get(degreeSlug) || null;

      const domainSlug = slugify(row.domainCat);
      let domainCatId = catMap.get(domainSlug) || catMap.get(`browse-${domainSlug}`) || null;

      const rootSlug = slugify(row.rootCat);
      const rootCatId = catMap.get(rootSlug) || null;

      const categoryIds = [degreeCatId, domainCatId, rootCatId].filter(Boolean);

      const feeId = feeMap.get(row.feeAmount) || null;

      const durSlug = slugify(row.durationStr);
      const durationId = durationMap.get(durSlug) || null;

      const slug = `${slugify(row.uniName)}-${slugify(row.courseTitle)}`;

      const courseDoc = await Course.create({
        title: `${row.uniName} - ${row.courseTitle}`,
        slug: slug,
        university: uniId ? [uniId] : [],
        categories: categoryIds,
        fee: feeId,
        duration: durationId,
        description: `${row.courseTitle} offered by ${row.uniName} in ${row.domainCat}. Degree Level: ${row.degreeLevel}.`,
        order: order++,
        featured: true,
        enabled: true,
      });

      console.log(`✅ Seeded Course #${order - 1}: "${courseDoc.title}" | Uni: ${row.uniName} | Fee: ₹${row.feeAmount.toLocaleString("en-IN")} | Dur: ${row.durationStr}`);
    }

    console.log(`\n🎉 Successfully seeded ALL ${master75Rows.length} courses directly into unified Course collection!`);
  } catch (error) {
    console.error("❌ Error in seedUnifiedCoursesMaster:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedUnifiedCoursesMaster();
