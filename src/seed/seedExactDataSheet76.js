"use strict";

/**
 * seedExactDataSheet76.js
 *
 * Seeds MongoDB with:
 * 1. UNIQUE Master Subcourses (Finance, Marketing, Leadership, HR, Data Science, Machine Learning, AI Courses, etc.)
 * 2. Unified Course documents (DBA, MBA, Dual Degree, Certificate/Master programs) referencing unique Subcourse ObjectIds.
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Course } = require("../model/Course");
const { University } = require("../model/University");
const { Category } = require("../model/Category");
const { Subcourse } = require("../model/Subcourse");
const { Fee } = require("../model/Fee");
const { Duration } = require("../model/Duration");
const { Workspace } = require("../model/Workspace");

const { Media } = require("../model/Media");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 📌 18 Master Universities Name Normalizer
function getNormalizedUniName(rawName) {
  const name = (rawName || "").trim();
  if (/edgewood/i.test(name)) return "Edgewood University";
  if (/esgci/i.test(name)) return "ESGCI, Paris";
  if (/rushford/i.test(name)) return "Rushford Business School";
  if (/golden gate|ggu/i.test(name)) return "Golden Gate University";
  if (/ssbm/i.test(name)) return "SSBM Geneva";
  if (/liverpool/i.test(name)) return "Liverpool Business School";
  if (/paris school/i.test(name)) return "Paris School of Business";
  if (/iit roorkee/i.test(name)) return "IIT Roorkee";
  if (/iit delhi/i.test(name)) return "IIT Delhi";
  if (/iit madras/i.test(name)) return "IIT Madras";
  if (/iim kozhikode/i.test(name)) return "IIM Kozhikode";
  if (/iim bangalore|iimb/i.test(name)) return "IIM Bangalore";
  if (/iim udaipur/i.test(name)) return "IIM Udaipur";
  if (/iim lucknow/i.test(name)) return "IIM Lucknow";
  if (/iim nagpur/i.test(name)) return "IIM Nagpur";
  if (/iim indore/i.test(name)) return "IIM Indore";
  if (/iiit/i.test(name)) return "IIIT Bangalore";
  if (/xlri/i.test(name)) return "XLRI Jamshedpur";
  return name;
}

// 📌 18 Master Universities Exact PNG Logo File Mapping
const UNI_LOGO_FILENAME_MAP = {
  "Edgewood University": "Edgewood University logo.png",
  "ESGCI, Paris": "ESGCI logo.png",
  "Rushford Business School": "Rushford Business School.png",
  "Golden Gate University": "Golden Gate University.png",
  "SSBM Geneva": "SSBM Geneva.png",
  "Liverpool Business School": "Liverpool Business School.png",
  "Paris School of Business": "Paris school of business.png",
  "IIT Roorkee": "IIT roorkee.png",
  "IIT Delhi": "IIT delhi.png",
  "IIT Madras": "IIT Madras.png",
  "IIM Kozhikode": "IIM Kozhikode.png",
  "IIM Bangalore": "IIMB.png",
  "IIM Udaipur": "IIm udaipur.png",
  "IIM Lucknow": "IIM Lucknow.png",
  "IIM Nagpur": "IIM nagpur.png",
  "IIM Indore": "IIM Indore.png",
  "IIIT Bangalore": "IIIT Bangalore.png",
  "XLRI Jamshedpur": "XLRI.png",
};

// 📌 Unique Master Subcourses Catalog
const masterSubcoursesCatalog = [
  { name: "General Management", slug: "general-management", topic: "management" },
  { name: "Finance", slug: "finance", topic: "finance" },
  { name: "Leadership & Strategic Management", slug: "leadership", topic: "leadership" },
  { name: "Marketing", slug: "marketing", topic: "management" },
  { name: "Human Resource Management (HR)", slug: "human-resource-management", topic: "hr" },
  { name: "Data Science & Business Analytics", slug: "data-science", topic: "data science" },
  { name: "Machine Learning & Artificial Intelligence", slug: "machine-learning", topic: "machine learning" },
  { name: "Generative AI & Agentic AI", slug: "generative-ai", topic: "ai courses" },
  { name: "Banking & Finance", slug: "banking-finance", topic: "banking" },
  { name: "Supply Chain & Operations Management", slug: "supply-chain-management", topic: "management" },
  { name: "Healthcare Management", slug: "healthcare-management", topic: "management" },
  { name: "International Business", slug: "international-business", topic: "management" },
  { name: "Cybersecurity Management", slug: "cybersecurity-management", topic: "management" },
  { name: "Tax Management", slug: "tax-management", topic: "finance" },
  { name: "IT Management", slug: "it-management", topic: "management" },
  { name: "Advanced Project Management", slug: "advanced-project-management", topic: "management" },
  { name: "Sales & Marketing", slug: "sales-marketing", topic: "management" },
  { name: "Social Science", slug: "social-science", topic: "social science" },
  { name: "Science", slug: "science", topic: "science" },
  { name: "Law", slug: "law", topic: "law" },
  { name: "Entrepreneurship", slug: "entrepreneurship", topic: "entrepreneurship" },
];

// Helper to resolve the matching master subcourse slug
function getMasterSubcourseSlug(topicStr, titleStr) {
  const t = (topicStr || "").toLowerCase().trim();
  const title = (titleStr || "").toLowerCase().trim();

  // Check exact topic first to avoid cross-matching
  if (t === "finance") return "finance";
  if (t === "banking") return "banking-finance";
  if (t === "leadership") return "leadership";
  if (t === "hr") return "human-resource-management";
  if (t === "ai courses") return "generative-ai";
  if (t === "machine learning") return "machine-learning";
  if (t === "data science") return "data-science";
  if (t === "management") return "management";
  if (t === "social science") return "social-science";
  if (t === "science") return "science";
  if (t === "law") return "law";
  if (t === "entrepreneurship") return "entrepreneurship";
  if (t === "healthcare") return "healthcare-management";

  // Fallback to title keywords if topic doesn't match
  if (title.includes("finance") || title.includes("tax") || title.includes("accounting") || title.includes("valuation")) {
    return "finance";
  }
  if (title.includes("banking")) {
    return "banking-finance";
  }
  if (title.includes("leadership") || title.includes("strategy")) {
    return "leadership";
  }
  if (title.includes("human resource") || title.includes("psychology") || title.includes("analytics")) {
    return "human-resource-management";
  }
  if (title.includes("generative ai") || title.includes("agentic ai") || title.includes("ai leadership") || title.includes("artificial intelligence")) {
    return "generative-ai";
  }
  if (title.includes("machine learning") || title.includes("deep learning")) {
    return "machine-learning";
  }
  if (title.includes("data science") || title.includes("business analytics")) {
    return "data-science";
  }
  if (title.includes("marketing") || title.includes("sales")) {
    return "marketing";
  }
  if (title.includes("supply chain") || title.includes("operations")) {
    return "supply-chain-management";
  }
  if (title.includes("healthcare")) {
    return "healthcare-management";
  }
  if (title.includes("international business")) {
    return "international-business";
  }
  if (title.includes("cybersecurity")) {
    return "cybersecurity-management";
  }
  if (title.includes("it management") || title.includes("information technology")) {
    return "it-management";
  }
  if (title.includes("project management")) {
    return "advanced-project-management";
  }

  return "general-management";
}

// 📌 Official 76 Data Sheet Rows
const officialSheet76 = [
  // ── Edgewood University ───────────────────────────────────────────────────
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Edgewood University", degreeLevel: "Doctorate", subTitle: "General Management & Leadership", topic: "Management", feeAmount: 950000, feeTitle: "₹9,50,000", durationStr: "24 months", months: 24, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Edgewood University", degreeLevel: "Doctorate", subTitle: "Finance & Corporate Valuation", topic: "Finance", feeAmount: 950001, feeTitle: "₹9,50,001", durationStr: "25 months", months: 25, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Edgewood University", degreeLevel: "Doctorate", subTitle: "Strategic Leadership", topic: "Leadership", feeAmount: 950002, feeTitle: "₹9,50,002", durationStr: "26 months", months: 26, provider: "upGrad" },
  { mainCourse: "MBA + DBA (Dual Degree)", typeGroup: "Global Universities", uniName: "Edgewood University", degreeLevel: "Master + Doctorate (Dual)", subTitle: "MBA + DBA - Finance", topic: "Finance", feeAmount: 1170000, feeTitle: "₹11,70,000", durationStr: "30 months", months: 30, provider: "upGrad" },
  { mainCourse: "MBA + DBA (Dual Degree)", typeGroup: "Global Universities", uniName: "Edgewood University", degreeLevel: "Master + Doctorate (Dual)", subTitle: "MBA + DBA - Leadership", topic: "Leadership", feeAmount: 1170000, feeTitle: "₹11,70,000", durationStr: "30 months", months: 30, provider: "upGrad" },

  // ── ESGCI, Paris ──────────────────────────────────────────────────────────
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "ESGCI, Paris", degreeLevel: "Doctorate", subTitle: "Online DBA (Doctor of Business Administration)", topic: "Management", feeAmount: 715000, feeTitle: "₹7,15,000", durationStr: "24 months", months: 24, provider: "upGrad" },

  // ── Rushford Business School ──────────────────────────────────────────────
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Rushford Business School, Switzerland", degreeLevel: "Doctorate", subTitle: "DBA - General", topic: "Management", feeAmount: 650000, feeTitle: "₹6,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Rushford Business School, Switzerland", degreeLevel: "Doctorate", subTitle: "DBA - International Business", topic: "Management", feeAmount: 650000, feeTitle: "₹6,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Rushford Business School, Switzerland", degreeLevel: "Doctorate", subTitle: "DBA - Healthcare Management", topic: "Management", feeAmount: 650000, feeTitle: "₹6,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Rushford Business School, Switzerland", degreeLevel: "Doctorate", subTitle: "DBA - Human Resource Management", topic: "HR", feeAmount: 650000, feeTitle: "₹6,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Rushford Business School, Switzerland", degreeLevel: "Doctorate", subTitle: "DBA - Supply Chain Management", topic: "Management", feeAmount: 650000, feeTitle: "₹6,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Rushford Business School, Switzerland", degreeLevel: "Doctorate", subTitle: "DBA - Finance", topic: "Finance", feeAmount: 650000, feeTitle: "₹6,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Rushford Business School, Switzerland", degreeLevel: "Doctorate", subTitle: "DBA - Data Science", topic: "Data Science", feeAmount: 650000, feeTitle: "₹6,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Rushford Business School, Switzerland", degreeLevel: "Doctorate", subTitle: "DBA - Marketing", topic: "Management", feeAmount: 650000, feeTitle: "₹6,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Rushford Business School, Switzerland", degreeLevel: "Doctorate", subTitle: "DBA - Business Analytics", topic: "Data Science", feeAmount: 650000, feeTitle: "₹6,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },

  // ── Golden Gate University (GGU) ──────────────────────────────────────────
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Doctorate", subTitle: "DBA - Finance", topic: "Finance", feeAmount: 1065000, feeTitle: "₹10,65,000", durationStr: "27 months", months: 27, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Doctorate", subTitle: "DBA - Marketing", topic: "Management", feeAmount: 1065000, feeTitle: "₹10,65,000", durationStr: "27 months", months: 27, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Doctorate", subTitle: "DBA - Leadership", topic: "Leadership", feeAmount: 1065000, feeTitle: "₹10,65,000", durationStr: "27 months", months: 27, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Doctorate", subTitle: "DBA - General", topic: "Management", feeAmount: 1065000, feeTitle: "₹10,65,000", durationStr: "27 months", months: 27, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Doctorate", subTitle: "DBA - Business Analytics", topic: "Data Science", feeAmount: 1065000, feeTitle: "₹10,65,000", durationStr: "27 months", months: 27, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Doctorate", subTitle: "DBA - Generative AI", topic: "AI Courses", feeAmount: 1065000, feeTitle: "₹10,65,000", durationStr: "27 months", months: 27, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Master", subTitle: "MBA - Business Analytics Concentration", topic: "Data Science", feeAmount: 1200000, feeTitle: "₹12,00,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Master", subTitle: "MBA - Industrial Organizational Psychology Concentration", topic: "HR", feeAmount: 1200000, feeTitle: "₹12,00,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Master", subTitle: "MBA - Information Technology Management", topic: "Management", feeAmount: 1200000, feeTitle: "₹12,00,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Master", subTitle: "MBA - Finance", topic: "Finance", feeAmount: 1200000, feeTitle: "₹12,00,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Master", subTitle: "MBA - Marketing", topic: "Management", feeAmount: 1200000, feeTitle: "₹12,00,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Master", subTitle: "MBA - Adaptive Leadership", topic: "Leadership", feeAmount: 1200000, feeTitle: "₹12,00,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Golden Gate University (GGU), San Francisco", degreeLevel: "Master", subTitle: "MBA - General", topic: "Management", feeAmount: 1200000, feeTitle: "₹12,00,000", durationStr: "36 months", months: 36, provider: "upGrad" },

  // ── SSBM Geneva ───────────────────────────────────────────────────────────
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Global and International Management", topic: "Management", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Cybersecurity Management", topic: "Management", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Human Resources Management", topic: "HR", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Tax Management", topic: "Finance", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Finance and Banking", topic: "Banking", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Marketing", topic: "Management", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Operations Management", topic: "Management", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Strategic Management", topic: "Leadership", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Entrepreneurship", topic: "Management", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - IT Management", topic: "Management", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Energy Management", topic: "Management", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Health Care Management", topic: "Management", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Data Science", topic: "Data Science", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Machine Learning", topic: "Machine Learning", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Finance", topic: "Finance", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - International Business Leadership", topic: "Leadership", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Global Supply Chain Management", topic: "Management", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - Accounting", topic: "Finance", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },
  { mainCourse: "DBA", typeGroup: "Global Universities", uniName: "SSBM Geneva (Swiss School of Business & Management)", degreeLevel: "Doctorate", subTitle: "DBA - AML Compliance", topic: "Finance", feeAmount: 750000, feeTitle: "₹7,50,000", durationStr: "36 months", months: 36, provider: "upGrad" },

  // ── Liverpool Business School ─────────────────────────────────────────────
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Liverpool Business School (with IIM Udaipur)", degreeLevel: "Master", subTitle: "MBA - Business Analytics", topic: "Data Science", feeAmount: 510000, feeTitle: "₹5,10,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Liverpool Business School (with IIM Udaipur)", degreeLevel: "Master", subTitle: "MBA - Finance", topic: "Finance", feeAmount: 510000, feeTitle: "₹5,10,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Liverpool Business School (with IIM Udaipur)", degreeLevel: "Master", subTitle: "MBA - Marketing", topic: "Management", feeAmount: 510000, feeTitle: "₹5,10,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Liverpool Business School (with IIM Udaipur)", degreeLevel: "Master", subTitle: "MBA - Leadership", topic: "Leadership", feeAmount: 510000, feeTitle: "₹5,10,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Liverpool Business School (with IIM Udaipur)", degreeLevel: "Master", subTitle: "MBA - Human Resource Management", topic: "HR", feeAmount: 510000, feeTitle: "₹5,10,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Liverpool Business School (with IIM Udaipur)", degreeLevel: "Master", subTitle: "MBA - Operations and Supply Chain Management", topic: "Management", feeAmount: 510000, feeTitle: "₹5,10,000", durationStr: "18 months", months: 18, provider: "upGrad" },

  // ── Paris School of Business ──────────────────────────────────────────────
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Paris School of Business (with IIM Lucknow)", degreeLevel: "Master", subTitle: "MBA - Strategic Leadership", topic: "Leadership", feeAmount: 680000, feeTitle: "₹6,80,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Paris School of Business (with IIM Lucknow)", degreeLevel: "Master", subTitle: "MBA - AI and Technology", topic: "AI Courses", feeAmount: 680000, feeTitle: "₹6,80,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Paris School of Business (with IIM Lucknow)", degreeLevel: "Master", subTitle: "MBA - Finance", topic: "Finance", feeAmount: 680000, feeTitle: "₹6,80,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Paris School of Business (with IIM Lucknow)", degreeLevel: "Master", subTitle: "MBA - Marketing", topic: "Management", feeAmount: 680000, feeTitle: "₹6,80,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "Global Universities", uniName: "Paris School of Business (with IIM Lucknow)", degreeLevel: "Master", subTitle: "MBA - Operations and Supply Chain", topic: "Management", feeAmount: 680000, feeTitle: "₹6,80,000", durationStr: "18 months", months: 18, provider: "upGrad" },

  // ── Standalone IIT / IIM / IIIT Programs ─────────────────────────────────
  { mainCourse: "PG Certificate in Data Science, Machine Learning & Generative AI", typeGroup: "IIT", uniName: "IIT Roorkee (CEC)", degreeLevel: "Certification", subTitle: "PG Certificate in Data Science, Machine Learning & Generative AI", topic: "Data Science", feeAmount: 175000, feeTitle: "₹1,75,000", durationStr: "8 months", months: 8, provider: "TimesPro" },
  { mainCourse: "Executive Programme in Advanced Project Management", typeGroup: "IIT", uniName: "IIT Delhi (CEP)", degreeLevel: "Certification", subTitle: "Executive Programme in Advanced Project Management", topic: "Management", feeAmount: 129800, feeTitle: "₹1,29,800", durationStr: "6 months", months: 6, provider: "TimesPro" },
  { mainCourse: "Advanced Certificate in Applied Artificial Intelligence & Deep Learning", typeGroup: "IIT", uniName: "IIT Madras (IITM Pravartak)", degreeLevel: "Certification", subTitle: "Advanced Certificate in Applied Artificial Intelligence & Deep Learning", topic: "Machine Learning", feeAmount: 194700, feeTitle: "₹1,94,700", durationStr: "7 months", months: 7, provider: "TimesPro" },

  { mainCourse: "Certificate Programme in Strategic AI for Business Professionals", typeGroup: "IIM", uniName: "IIM Kozhikode", degreeLevel: "Certification", subTitle: "Certificate Programme in Strategic AI for Business Professionals", topic: "AI Courses", feeAmount: 199000, feeTitle: "₹1,99,000", durationStr: "6 months", months: 6, provider: "upGrad" },
  { mainCourse: "Young Leaders Programme in General Management", typeGroup: "IIM", uniName: "IIM Bangalore (IIMBx)", degreeLevel: "Certification", subTitle: "Young Leaders Programme in General Management", topic: "Management", feeAmount: 292640, feeTitle: "₹2,92,640", durationStr: "11 months", months: 11, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "IIM", uniName: "IIM Udaipur (via Liverpool MBA pathway)", degreeLevel: "Master", subTitle: "MBA General Management", topic: "Management", feeAmount: 510000, feeTitle: "₹5,10,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "MBA", typeGroup: "IIM", uniName: "IIM Lucknow (via Paris School of Business MBA pathway)", degreeLevel: "Master", subTitle: "MBA General Management", topic: "Management", feeAmount: 510000, feeTitle: "₹5,10,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "Post Graduate Certificate Programme in Advanced HR Analytics", typeGroup: "IIM", uniName: "IIM Nagpur", degreeLevel: "Certification", subTitle: "Post Graduate Certificate Programme in Advanced HR Analytics", topic: "HR", feeAmount: 160000, feeTitle: "₹1,60,000", durationStr: "7 months", months: 7, provider: "TimesPro" },
  { mainCourse: "Executive Programme in Sales and Marketing (EPSM)", typeGroup: "IIM", uniName: "IIM Indore", degreeLevel: "Certification", subTitle: "Executive Programme in Sales and Marketing (EPSM)", topic: "Management", feeAmount: 200000, feeTitle: "₹2,00,000", durationStr: "12 months", months: 12, provider: "TimesPro" },

  { mainCourse: "Executive Programme in Generative AI for Leaders", typeGroup: "Other", uniName: "IIIT Bangalore", degreeLevel: "Certification", subTitle: "Executive Programme in Generative AI for Leaders", topic: "AI Courses", feeAmount: 225000, feeTitle: "₹2,25,000", durationStr: "5 months", months: 5, provider: "upGrad" },
  { mainCourse: "Executive Post Graduate Certificate Programme in Data Science & AI", typeGroup: "Other", uniName: "IIIT Bangalore", degreeLevel: "Certification", subTitle: "Executive Post Graduate Certificate Programme in Data Science & AI", topic: "Data Science", feeAmount: 180000, feeTitle: "₹1,80,000", durationStr: "6 months", months: 6, provider: "upGrad" },
  { mainCourse: "Professional Certificate Programme in Data Science with Agentic AI", typeGroup: "Other", uniName: "IIIT Bangalore", degreeLevel: "Certification", subTitle: "Professional Certificate Programme in Data Science with Agentic AI", topic: "Data Science", feeAmount: 99000, feeTitle: "₹99,000", durationStr: "6 months", months: 6, provider: "upGrad" },
  { mainCourse: "Executive Post Graduate Programme in Applied AI and Agentic AI", typeGroup: "Other", uniName: "IIIT Bangalore", degreeLevel: "Certification", subTitle: "Executive Post Graduate Programme in Applied AI and Agentic AI", topic: "AI Courses", feeAmount: 140000, feeTitle: "₹1,40,000", durationStr: "7 months", months: 7, provider: "upGrad" },
  { mainCourse: "Executive Diploma in Machine Learning & Artificial Intelligence", typeGroup: "Other", uniName: "IIIT Bangalore", degreeLevel: "Diploma", subTitle: "Executive Diploma in Machine Learning & Artificial Intelligence", topic: "Machine Learning", feeAmount: 310000, feeTitle: "₹3,10,000", durationStr: "12 months", months: 12, provider: "upGrad" },
  { mainCourse: "Chief Technology Officer & AI Leadership Programme", typeGroup: "Other", uniName: "IIIT Bangalore (with IIM Udaipur)", degreeLevel: "Certification", subTitle: "Chief Technology Officer & AI Leadership Programme", topic: "Leadership", feeAmount: 365000, feeTitle: "₹3,65,000", durationStr: "6 months", months: 6, provider: "upGrad" },
  { mainCourse: "Master of Science in Machine Learning & Artificial Intelligence", typeGroup: "Other", uniName: "IIIT Bangalore with LJMU", degreeLevel: "Master", subTitle: "Master of Science in Machine Learning & Artificial Intelligence", topic: "Machine Learning", feeAmount: 535000, feeTitle: "₹5,35,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "Master of Science in Data Science", typeGroup: "Other", uniName: "IIIT Bangalore with LJMU", degreeLevel: "Master", subTitle: "Master of Science in Data Science", topic: "Data Science", feeAmount: 485000, feeTitle: "₹4,85,000", durationStr: "18 months", months: 18, provider: "upGrad" },
  { mainCourse: "Executive Development Programme in Human Resource Management", typeGroup: "Other", uniName: "XLRI Jamshedpur (with SHRM)", degreeLevel: "Certification", subTitle: "Executive Development Programme in Human Resource Management", topic: "HR", feeAmount: 180000, feeTitle: "₹1,80,000", durationStr: "6-7 months", months: 6, provider: "TimesPro" },
  
  // ── O.P. Jindal Global University ─────────────────────────────────────────
  { mainCourse: "B. Com", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Bachelor", subTitle: "International Accounting & Finance", topic: "Finance", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "3 years", months: 36, provider: "OPJ" },
  { mainCourse: "B.Sc.", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Bachelor", subTitle: "Finance & Entrepreneurship", topic: "Finance", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "3 years", months: 36, provider: "OPJ" },
  { mainCourse: "B.Sc.", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Bachelor", subTitle: "AI & Finance", topic: "AI Courses", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "3 years", months: 36, provider: "OPJ" },
  { mainCourse: "M.A.", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Master", subTitle: "Criminology & Criminal Justice", topic: "Social Science", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "2 years", months: 24, provider: "OPJ" },
  { mainCourse: "M.Sc.", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Master", subTitle: "AI & Finance", topic: "AI Courses", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "2 years", months: 24, provider: "OPJ" },
  { mainCourse: "M.Sc.", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Master", subTitle: "Environmental Change & Sustainability", topic: "Science", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "2 years", months: 24, provider: "OPJ" },
  { mainCourse: "M.Sc.", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Master", subTitle: "Global Health & Human Development", topic: "Healthcare", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "2 years", months: 24, provider: "OPJ" },
  { mainCourse: "M.Sc.", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Master", subTitle: "Strategic Communication", topic: "Leadership", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "2 years", months: 24, provider: "OPJ" },
  { mainCourse: "M.A.", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Master", subTitle: "Educational Leadership and Governance", topic: "Leadership", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "2 years", months: 24, provider: "OPJ" },
  { mainCourse: "M.Sc.", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Master", subTitle: "Design Thinking, Innovation and Strategy", topic: "Management", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "2 years", months: 24, provider: "OPJ" },
  { mainCourse: "M.A.", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Master", subTitle: "Legislative Drafting", topic: "Law", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "2 years", months: 24, provider: "OPJ" },
  { mainCourse: "M.Sc.", typeGroup: "Other", uniName: "O.P. Jindal Global University", degreeLevel: "Master", subTitle: "Entrepreneurship, Innovation & Start-ups", topic: "Entrepreneurship", feeAmount: 275000, feeTitle: "₹2,75,000", durationStr: "2 years", months: 24, provider: "OPJ" },
];

async function seedExactDataSheet76() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    // 1️⃣ Clear old Courses, Subcourses, and duplicate Universities
    console.log("🧹 Clearing old Courses, Subcourses & Universities...");
    await Course.deleteMany({});
    await Subcourse.deleteMany({});
    await University.deleteMany({});

    // Fetch all Media docs for logo linking
    const allMediaDocs = await Media.find({ removed: false }).lean();

    // 2️⃣ Ensure Workspaces
    const workspacesMap = new Map();
    for (const wsName of ["upGrad", "TimesPro", "OPJ"]) {
      let wsDoc = await Workspace.findOne({ name: new RegExp(`^${wsName}$`, "i") });
      if (!wsDoc) {
        wsDoc = await Workspace.create({
          name: wsName,
          slug: slugify(wsName),
          description: `${wsName} Partner Workspace`,
          enabled: true,
          removed: false,
        });
      }
      workspacesMap.set(wsName.toLowerCase(), wsDoc._id);
    }

    // 2.5️⃣ Ensure "Bachelor" category exists and has "Master" category's icon/logo
    console.log("💎 Ensuring Bachelor Category exists with Master's icon...");
    let bachelorCatId = null;
    const masterCat = await Category.findOne({ name: { $regex: /^master/i }, removed: false });
    if (masterCat) {
      let bachelorCat = await Category.findOne({ name: { $regex: /^bachelor/i }, removed: false });
      const targetOrder = (masterCat.order || 0) + 1;
      
      if (!bachelorCat) {
        console.log("   ➡️ Creating Bachelor category...");
        
        // Push other categories down to make space
        await Category.updateMany(
          { order: { $gte: targetOrder }, removed: false },
          { $inc: { order: 1 } }
        );

        bachelorCat = await Category.create({
          name: "Bachelor",
          slug: "bachelor",
          icon: masterCat.icon,
          image: masterCat.image,
          logo: masterCat.logo,
          logoSrc: masterCat.logoSrc,
          imageSrc: masterCat.imageSrc,
          order: targetOrder,
          enabled: true,
          removed: false,
        });
      } else {
        console.log("   ➡️ Updating Bachelor category icon and order...");
        
        // If current order isn't correct, shift others and update
        if (bachelorCat.order !== targetOrder) {
           await Category.updateMany(
             { order: { $gte: targetOrder }, _id: { $ne: bachelorCat._id }, removed: false },
             { $inc: { order: 1 } }
           );
        }

        await Category.updateOne(
          { _id: bachelorCat._id },
          { $set: { 
              icon: masterCat.icon, 
              image: masterCat.image,
              logo: masterCat.logo,
              logoSrc: masterCat.logoSrc,
              imageSrc: masterCat.imageSrc,
              order: targetOrder
            } 
          }
        );
      }
      bachelorCatId = bachelorCat._id;
    }

    // 2.6️⃣ Set Bachelor as parent for Finance and AI Courses
    if (bachelorCatId) {
      console.log("💎 Setting Bachelor as parent for Finance and AI Courses...");
      const targetSubcats = ["Finance", "AI Courses"];
      for (const catName of targetSubcats) {
        const cat = await Category.findOne({ name: { $regex: new RegExp(`^${catName}$`, "i") }, removed: false });
        if (cat) {
          await Category.updateOne(
            { _id: cat._id },
            { $addToSet: { parentId: bachelorCatId } }
          );
          console.log(`   ➡️ Added Bachelor as parent to ${cat.name}`);
        }
      }
    }

    // 3️⃣ Map Existing Categories (Read-Only - NEVER creates or modifies Category documents)
    const mainDegreeMap = new Map();
    const topicSubcatMap = new Map();

    const existingCategories = await Category.find({ removed: false }).lean();
    for (const cat of existingCategories) {
      if (cat.name) {
        mainDegreeMap.set(cat.name.toLowerCase(), cat._id);
        topicSubcatMap.set(cat.name.toLowerCase(), cat._id);
      }
      if (cat.slug) {
        mainDegreeMap.set(cat.slug.toLowerCase(), cat._id);
        topicSubcatMap.set(cat.slug.toLowerCase(), cat._id);
      }
    }
    // Aliases for matching spreadsheet names to existing category slugs
    if (mainDegreeMap.has("master-doctorate-dual")) {
      mainDegreeMap.set("dual", mainDegreeMap.get("master-doctorate-dual"));
    }
    if (topicSubcatMap.has("browse-human-resource")) {
      topicSubcatMap.set("hr", topicSubcatMap.get("browse-human-resource"));
    }

    // 5️⃣ Create UNIQUE Master Subcourses
    console.log("💎 Creating Unique Master Subcourses...");
    const masterSubcourseMap = new Map();

    for (const sub of masterSubcoursesCatalog) {
      const topicId = topicSubcatMap.get(sub.topic.toLowerCase()) || topicSubcatMap.get("management");
      let subDoc = await Subcourse.findOne({ slug: sub.slug });
      if (!subDoc) {
        subDoc = await Subcourse.create({
          title: sub.name,
          slug: sub.slug,
          category: topicId,
          shortDescription: `Master specialization in ${sub.name}`,
          description: `Comprehensive specialization curriculum for ${sub.name}`,
          enabled: true,
          removed: false,
        });
      }
      masterSubcourseMap.set(sub.slug, subDoc._id);
    }

    // 6️⃣ Group rows by mainCourse title to create Unique Master Course Documents
    console.log("🚀 Grouping rows by mainCourse title to create Unique Master Course Documents...");
    const groupedCoursesMap = new Map();

    for (const row of officialSheet76) {
      const courseTitle = row.mainCourse.trim();
      if (!groupedCoursesMap.has(courseTitle)) {
        groupedCoursesMap.set(courseTitle, {
          title: courseTitle,
          degreeLevel: row.degreeLevel,
          typeGroup: row.typeGroup,
          rows: [],
        });
      }
      groupedCoursesMap.get(courseTitle).rows.push(row);
    }

    console.log(`Found ${groupedCoursesMap.size} Unique Master Courses to seed.`);

    let createdCoursesCount = 0;

    for (const [courseTitle, group] of groupedCoursesMap.entries()) {
      const mainDegreeId = mainDegreeMap.get(group.degreeLevel.toLowerCase()) || mainDegreeMap.get("doctorate");

      // Group rows by University for this Course
      const uniRowsMap = new Map();

      for (const row of group.rows) {
        const cleanUniName = getNormalizedUniName(row.uniName);
        if (!uniRowsMap.has(cleanUniName)) {
          uniRowsMap.set(cleanUniName, []);
        }
        uniRowsMap.get(cleanUniName).push(row);
      }

      const universityOfferings = [];

      for (const [cleanUniName, uRows] of uniRowsMap.entries()) {
        const uniSlug = slugify(cleanUniName);

        // Find or create University
        let uniDoc = await University.findOne({ slug: uniSlug });
        if (!uniDoc) {
          const logoFileName = UNI_LOGO_FILENAME_MAP[cleanUniName];
          let logoMediaId = null;

          if (logoFileName) {
            const lowerFile = logoFileName.toLowerCase();
            const baseName = lowerFile.replace(".png", "");
            const mediaDoc = allMediaDocs.find((m) => {
              const mName = (m.name || "").toLowerCase();
              const mAlt = (m.alt || "").toLowerCase();
              return mName === lowerFile || mAlt === baseName || mName.startsWith(lowerFile);
            });
            if (mediaDoc) logoMediaId = mediaDoc._id;
          }

          uniDoc = await University.create({
            name: cleanUniName,
            slug: uniSlug,
            logoSrc: logoMediaId,
            enabled: true,
            removed: false,
          });
        }

        const subcourseItems = [];
        const topicCatIds = new Set();
        let mainFeeId = null;
        let mainDurId = null;
        let mainWorkspaceId = null;

        for (const row of uRows) {
          // Support multiple topics separated by +, &, or commas (e.g. "AI + Finance")
          const topicParts = (row.topic || "").split(/[+&,]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
          const currentTopicCatIds = [];

          for (let part of topicParts) {
            if (part === "ai" || part === "ai courses") part = "ai courses";
            const catId = topicSubcatMap.get(part) || topicSubcatMap.get("management");
            if (catId) {
              topicCatIds.add(String(catId));
              currentTopicCatIds.push(catId);
            }
          }

          // Add typeGroup category if present (e.g. IIT, IIM)
          const typeGroupCatId = mainDegreeMap.get(row.typeGroup.toLowerCase());
          if (typeGroupCatId) {
            topicCatIds.add(String(typeGroupCatId));
          }

          // Find or create Fee
          let feeDoc = await Fee.findOne({ amount: row.feeAmount });
          if (!feeDoc) {
            feeDoc = await Fee.create({
              amount: row.feeAmount,
              title: row.feeTitle,
              slug: `fee-${slugify(row.feeTitle)}`,
              currency: "INR",
              enabled: true,
              removed: false,
            });
          }
          if (!mainFeeId) mainFeeId = feeDoc._id;

          // Find or create Duration
          let durDoc = await Duration.findOne({ months: row.months });
          if (!durDoc) {
            durDoc = await Duration.create({
              title: row.durationStr,
              slug: `${row.months}-months`,
              months: row.months,
              enabled: true,
              removed: false,
            });
          }
          if (!mainDurId) mainDurId = durDoc._id;

          const wsId = workspacesMap.get((row.provider || "upGrad").toLowerCase());
          if (!mainWorkspaceId) mainWorkspaceId = wsId;

          // Master Subcourse resolution
          const masterSlug = getMasterSubcourseSlug(row.topic, row.subTitle);
          const masterSubcourseId = masterSubcourseMap.get(masterSlug);
          const masterSubDoc = masterSubcoursesCatalog.find((s) => s.slug === masterSlug);
          const cleanSubcourseTitle = row.subTitle;

          const domainName = row.topic || "Management";

          const keyHighlightsData = [
            `Learn from ${cleanUniName}'s industry-focused curriculum`,
            "Live online sessions with experienced faculty",
            "Real-world case studies and practical assignments",
            "Hands-on capstone project",
            "Flexible learning for working professionals",
            `Prestigious ${cleanUniName} certificate upon completion`,
            `Practical ${domainName} analytics and leadership skills`,
            "Career-focused learning approach",
          ];

          const whoCanApplyData = [
            "Graduates from a recognized university",
            `${domainName} Professionals & Executives`,
            "Recruiters & Talent Acquisition Specialists",
            "Managers & Team Leaders",
            "Business Professionals & Career Switchers",
            `Entrepreneurs interested in ${domainName}`,
          ];

          const admissionProcessData = [
            "Submit Your Application",
            "Connect with a Programme Advisor",
            "Eligibility Verification",
            "Complete Fee Payment",
            "Begin Your Learning Journey",
          ];

          const overviewContent = `The ${row.subTitle} is designed for professionals and aspiring leaders who want to combine ${domainName} expertise with data-driven decision-making. The programme equips learners with practical knowledge of strategic management, workforce planning, talent management, and business strategy through live classes, real-world case studies, and hands-on learning. Whether you're looking to advance in your career or transition into leadership roles, this programme helps you build industry-relevant skills that organizations value.`;

          subcourseItems.push({
            subcourse: masterSubcourseId,
            category: currentTopicCatIds[0] || topicSubcatMap.get("management"),
            title: cleanSubcourseTitle,
            shortDescription: `${row.topic} Specialization`,
            description: overviewContent,
            content: overviewContent,
            keyHighlights: keyHighlightsData,
            whoCanApply: whoCanApplyData,
            admissionProcess: admissionProcessData,
            fee: feeDoc._id,
            duration: durDoc._id,
            enabled: true,
          });
        }

        universityOfferings.push({
          university: uniDoc._id,
          workspace: mainWorkspaceId,
          fee: mainFeeId,
          duration: mainDurId,
          category: Array.from(topicCatIds),
          subcourses: subcourseItems,
          enabled: true,
        });
      }

      const allCategoryIdsForCourse = new Set();
      if (mainDegreeId) allCategoryIdsForCourse.add(String(mainDegreeId));

      const typeGroupCatId = mainDegreeMap.get(group.typeGroup.toLowerCase());
      if (typeGroupCatId) allCategoryIdsForCourse.add(String(typeGroupCatId));

      for (const offering of universityOfferings) {
        if (offering.category) {
          offering.category.forEach((cId) => allCategoryIdsForCourse.add(String(cId)));
        }
      }

      const courseSlug = slugify(courseTitle);
      await Course.create({
        title: courseTitle,
        slug: courseSlug,
        description: `Official ${courseTitle} program with multiple university offerings & specializations.`,
        categories: Array.from(allCategoryIdsForCourse),
        enabled: true,
        removed: false,
        universityOfferings,
      });

      createdCoursesCount++;
      console.log(`✅ Created Unified Master Course: "${courseTitle}" (${courseSlug}) with ${universityOfferings.length} university offerings.`);
    }

    console.log(`\n🎉 Successfully seeded ${createdCoursesCount} Unique Master Course documents & ${masterSubcoursesCatalog.length} UNIQUE Master Subcourses.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seedExactDataSheet76();
