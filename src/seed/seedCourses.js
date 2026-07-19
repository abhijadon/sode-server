"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Course } = require("../model/Course");

const programsData = [
  /* =========================
     DOCTORATE PROGRAMS
  ========================== */
  {
    category: "doctorate",
    image: "/assets/images/docrorate-1.png",
    logo: "/assets/images/ggu-logo.jpg",
    title: "Doctor of Business Administration",
    slug: "doctor-of-business-administration-ggu",
    university: "Golden Gate University",
    description:
      "Professionals can elevate their executive leadership capabilities with an elite online DBA. The business doctorate online through Golden Gate DBA drives strategic impact and growth.",
    duration: "27 Months",
    eligibility:
      "Masters Degree or Bachelors Degree with 5+ years of work experience.",
    brochureUrl: "/assets/pdf/ggu_dba.pdf",
    featured: true,
    order: 1,
  },
  {
    category: "doctorate",
    image: "/assets/images/docrorate-2.png",
    logo: "/assets/images/rushford-logo.jpg",
    title: "Doctor of Business Administration",
    slug: "doctor-of-business-administration-rushford",
    university: "Rushford University",
    description:
      "The program empowers executive leadership through Rushford DBA. This elite online DBA delivers strategic advantage through business doctorate online learning, which is globally recognised.",
    duration: "36 Months",
    eligibility:
      "Masters Degree or Bachelors Degree with 3+ years of work experience.",
    brochureUrl: "/assets/pdf/rushford_dba.pdf",
    featured: true,
    order: 2,
  },
  {
    category: "doctorate",
    image: "/assets/images/docrorate-3.png",
    logo: "/assets/images/esgci-logo.jpg",
    title: "Doctor of Business Administration",
    slug: "doctor-of-business-administration-esgci",
    university: "ESGCI",
    description:
      "Professionals get an edge to elevate leadership through ESGCI's Online DBA. This business doctorate for working professionals helps them in pursuing executive, elite, strategic growth.",
    duration: "24 Months",
    eligibility:
      "Masters Degree or Bachelor's Degree with 3+ years of work experience.",
    brochureUrl: "/assets/pdf/esgci_dba.pdf",
    featured: false,
    order: 3,
  },
  {
    category: "doctorate",
    image: "/assets/images/docrorate-4.png",
    logo: "/assets/images/ssbm-logo.jpg",
    title: "Doctor of Business Administration",
    slug: "doctor-of-business-administration-ssbm",
    university: "SSBM",
    description:
      "Executives scale their executive leadership through SSBM Geneva Online DBA. This strategic doctorate for working professionals helps in seeking elite doctorate online advancement.",
    duration: "36 Months",
    eligibility:
      "Bachelor's Degree with a minimum of 5 years of experience or Master's degree.",
    brochureUrl: "/assets/pdf/ssbm_dba.pdf",
    featured: false,
    order: 4,
  },
  {
    category: "doctorate",
    image: "/assets/images/docrorate-5.png",
    logo: "/assets/images/edgewood-logo.jpg",
    title: "Doctor of Business Administration",
    slug: "doctor-of-business-administration-edgewood",
    university: "Edgewood University",
    description:
      "Leaders redefine leadership excellence through Edgewood University Online DBA. This strategic doctorate online for working professionals worldwide enhances their abilities, impacting organisational growth.",
    duration: "24 Months",
    eligibility: "Master's Degree",
    brochureUrl: "/assets/pdf/edgewood_dba.pdf",
    featured: false,
    order: 5,
  },
  {
    category: "doctorate",
    image: "/assets/images/docrorate-6.png",
    logo: "/assets/images/edgewood-logo.jpg",
    title: "MBA + DBA",
    slug: "mba-dba-dual-edgewood",
    university: "Edgewood University",
    description:
      "Learners accelerate executive leadership through Edgewood University Online MBA + DBA. This combined degree of online DBA and online MBA curates knowledge of business, finance and management.",
    duration: "30 Months",
    eligibility: "Bachelors degree",
    brochureUrl: "/assets/pdf/edgewood_dba_mba.pdf",
    featured: true,
    order: 6,
  },

  /* =========================
     CERTIFICATION PROGRAMS
  ========================== */
  {
    category: "certification",
    image: "/assets/images/certification-1.webp",
    logo: "/assets/images/iim-logo.jpg",
    title: "Professional Certificate Programme in HR Management and Analytics",
    slug: "pcp-hr-management-analytics-iim-kozhikode",
    university: "IIM Kozhikode",
    description:
      "The Online HR Analytics helps professionals to gain Hr Analytics certification and gain expertise in workforce decision making and people analytics certification from IIM Kozhikode.",
    duration: "6 Month",
    eligibility: "Bachelors degree (Min. 3 yr Work Exp)",
    brochureUrl: "/assets/pdf/iim_main_brochure.pdf",
    featured: true,
    order: 7,
  },
  {
    category: "certification",
    image: "/assets/images/certification-2.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title:
      "Professional Certificate Programme in Data Science with Generative AI",
    slug: "pcp-data-science-generative-ai-iiitb",
    university: "IIIT Bangalore",
    description:
      "This Generative AI certification is for early-career professionals who wish to transition through an AI and data science course.",
    duration: "6 Month",
    eligibility: "Bachelors or Master’s Degree",
    brochureUrl: "/assets/pdf/IIITB_PCP_in_DS_with_GI.pdf",
    featured: true,
    order: 8,
  },
  {
    category: "certification",
    image: "/assets/images/certification-3.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title: "Executive Post Graduate Certificate Programme in Data Science & AI",
    slug: "epgc-data-science-ai-iiitb",
    university: "IIIT Bangalore",
    description:
      "This helps to gain credentials in both artificial intelligence certification and data analytics certification, offering in-depth knowledge in Data Science and ML.",
    duration: "6 Month",
    eligibility: "Bachelors or Master’s Degree",
    brochureUrl: "/assets/pdf/IIITB_EPGC_DS_AI.pdf",
    featured: false,
    order: 9,
  },
  {
    category: "certification",
    image: "/assets/images/certification-4.webp",
    logo: "/assets/images/iitkgp-logo.jpg",
    title: "Executive Post Graduate Certificate in Generative AI & Agentic AI",
    slug: "epgc-generative-ai-agentic-ai-iitkgp",
    university: "IIT Kharagpur",
    description:
      "This Generative AI certification is for early-career professionals who wish to transition through an AI and data science course.",
    duration: "6 Month",
    eligibility: "Bachelors or Master’s Degree",
    brochureUrl: "/assets/pdf/iitkgp_main_brochure.pdf",
    featured: true,
    order: 10,
  },
  {
    category: "certification",
    image: "/assets/images/certification-5.webp",
    logo: "/assets/images/mica-logo.jpg",
    title: "Advanced Certificate in Digital Marketing & Communication",
    slug: "advanced-certificate-digital-marketing-mica",
    university: "MICA",
    description:
      "MICA offers an Advanced Certificate, which empowers careers through an online digital marketing course for ambitious learners, gaining a Digital Marketing Certificate.",
    duration: "4 Month",
    eligibility: "Bachelors Degree",
    brochureUrl: "/assets/pdf/mica_digital_marketing_and_communication.pdf",
    featured: false,
    order: 11,
  },
  {
    category: "certification",
    image: "/assets/images/certification-6.webp",
    logo: "/assets/images/mica-logo.jpg",
    title: "Advanced Certificate in Digital Brand Communication Strategy",
    slug: "advanced-certificate-brand-communication-mica",
    university: "MICA",
    description:
      "The program strengthens strategic brand management capabilities through MICA's Advanced Certificate, enterprising brand-building course and communication strategy course expertise.",
    duration: "7 Month",
    eligibility: "Bachelors Degree",
    brochureUrl: "/assets/pdf/mica_digital_brand_communication_strategy.pdf",
    featured: false,
    order: 12,
  },

  /* =========================
     EXECUTIVE PROGRAMS
  ========================== */
  {
    category: "executive",
    image: "/assets/images/executive-1.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title: "Executive Programme in Generative AI for Leaders",
    slug: "executive-programme-generative-ai-leaders-iiitb",
    university: "IIIT Bangalore",
    description:
      "The Generative AI certification is offered in this AI leadership program, enriching professionals with AI for decision-making and empowering AI for business leaders.",
    duration: "5 Month",
    eligibility: "Bachelor's or Master’s Degree (Min. 4 years Work Experience)",
    brochureUrl:
      "/assets/pdf/iiitb_Executive_Program_in_Generative_AI_for_Leaders.pdf",
    featured: true,
    order: 13,
  },
  {
    category: "executive",
    image: "/assets/images/executive-2.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title: "Executive Post Graduate Programme in Applied AI and Agentic AI",
    slug: "executive-pgp-applied-ai-agentic-ai-iiitb",
    university: "IIIT Bangalore",
    description:
      "This certification program helps future-ready professionals advance their careers with an agentic AI course and an applied AI course, gaining AI agents certification.",
    duration: "30 Weeks",
    eligibility: "Bachelor's or Master’s Degree",
    brochureUrl: "/assets/pdf/IIITB_Applied_AI_and_Agentic_AI.pdf",
    featured: false,
    order: 14,
  },
  {
    category: "executive",
    image: "/assets/images/executive-3.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title: "Chief Technology Officer & AI Leadership Programme",
    slug: "cto-ai-leadership-programme-iiitb",
    university: "IIIT Bangalore",
    description:
      "The Chief Technology Officer program empowers leaders through a technology management course focused on digital transformation leadership.",
    duration: "6 Month",
    eligibility: "Bachelor's or Master’s Degree (Min. 8 years Work Experience)",
    brochureUrl: "/assets/pdf/IIITB_CTOAI_leadership_program.pdf",
    featured: true,
    order: 15,
  },

  /* =========================
     MASTER PROGRAMS
  ========================== */
  {
    category: "master",
    image: "/assets/images/master-1.webp",
    logo: "/assets/images/ggu-logo.jpg",
    title: "Master of Business Administration",
    slug: "master-of-business-administration-ggu",
    university: "Golden Gate University",
    description:
      "This elite educational program of Golden Gate University's online MBA advances careers for working professionals. This features fast track global MBA program with online flexibility and leadership focus development.",
    duration: "13 Months",
    eligibility: "Bachelor's Degree",
    brochureUrl: "/assets/pdf/ggu_mba.pdf",
    featured: true,
    order: 16,
  },
  {
    category: "master",
    image: "/assets/images/master-2.webp",
    logo: "/assets/images/liverpool-logo.png",
    title: "Master of Business Administration",
    slug: "master-of-business-administration-liverpool",
    university: "Liverpool Business School",
    description:
      "Professionals can accelerate growth through Liverpool Business Schools online MBA, designed for working professionals. It helps in seeking one year executive MBA online with additional months for specialisations, equipping advancement globally.",
    duration: "18 Months",
    eligibility: "Bachelor's Degree",
    brochureUrl: "/assets/pdf/ssbm_main_brochure.pdf",
    featured: true,
    order: 17,
  },
  {
    category: "master",
    image: "/assets/images/master-3.webp",
    logo: "/assets/images/liverpool-iiitb-logo.png",
    title: "M.Sc. Data Science",
    slug: "msc-data-science-ljmu-iiitb",
    university: "LJMU + IIIT Bangalore",
    description:
      "This program transforms the expertise of learners with LJMU and IITB's Masters in data science. Overall, this MSc Data Science online learning offers industry-ready analytics skills.",
    duration: "18 Months",
    eligibility: "Bachelor’s degree",
    brochureUrl: "/assets/pdf/liverpool_mba.pdf",
    featured: false,
    order: 18,
  },
  {
    category: "master",
    image: "/assets/images/master-4.webp",
    logo: "/assets/images/liverpool-iiitb-logo.png",
    title: "M.Sc. Machine Learning & AI",
    slug: "msc-machine-learning-ai-ljmu-iiitb",
    university: "LJMU + IIIT Bangalore",
    description:
      "Professionals lead innovation through LJMU and IITB artificial intelligence masters program. This is a blended masters in AI and ML with an advanced skill set and global excellence.",
    duration: "18 Months",
    eligibility: "Bachelor’s degree",
    brochureUrl: "/assets/pdf/iiitb_msc_ds.pdf",
    featured: false,
    order: 19,
  },
  {
    category: "master",
    image: "/assets/images/master-5.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title: "Executive Diploma in Machine Learning & AI",
    slug: "executive-diploma-machine-learning-ai-iiitb",
    university: "IIIT Bangalore",
    description:
      "This Master program is in emerging technologies and offers expertise in Machine learning through IIIT Bangalore. This artificial intelligence diploma integrates machine learning certification and deep learning course concepts for leadership roles.",
    duration: "18 Months",
    eligibility: "Bachelors or Masters Degree",
    brochureUrl: "/assets/pdf/iiitb_msc_ml_ai.pdf",
    featured: false,
    order: 20,
  },
];

async function seedCourses() {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb://crmadmin:Abhishek2028@172.105.37.57:27017/sode?authSource=admin";

    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);

    console.log("🔄 Upserting course data...");

    for (const program of programsData) {
      await Course.findOneAndUpdate(
        { slug: program.slug },
        { $set: program },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✅ Upserted course: [${program.category.toUpperCase()}] ${program.title} (${program.university})`);
    }

    console.log("\n🎉 All 20 courses successfully imported into MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
    process.exit(1);
  }
}

seedCourses();
