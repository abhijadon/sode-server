"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Course } = require("../model/Course");
const { Category } = require("../model/Category");
const { Duration } = require("../model/Duration");
const { Eligibility } = require("../model/Eligibility");
const { University } = require("../model/University");
const { Media } = require("../model/Media");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

function getFileName(url) {
  if (!url) return "file";
  const parts = url.split("/");
  return parts[parts.length - 1] || "file";
}

async function findOrCreateMedia(url, defaultName = "Media Asset") {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  let media = await Media.findOne({ url: cleanUrl });
  if (!media) {
    const fileName = getFileName(cleanUrl);
    const mimeType = fileName.endsWith(".png")
      ? "image/png"
      : fileName.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";

    media = await Media.create({
      name: defaultName || fileName,
      alt: defaultName || fileName,
      url: cleanUrl,
      bucket: "public-assets",
      key: `assets/${fileName}`,
      fileName,
      mimeType,
      size: 1024,
      enabled: true,
    });
  }
  return media._id;
}

const programsData = [
  {
    categorySlug: "doctorate",
    image: "/assets/images/docrorate-1.png",
    logo: "/assets/images/ggu-logo.jpg",
    title: "Doctor of Business Administration",
    slug: "doctor-of-business-administration-ggu",
    uniSlug: "golden-gate-university",
    description:
      "Professionals can elevate their executive leadership capabilities with an elite online DBA. The business doctorate online through Golden Gate DBA drives strategic impact and growth.",
    durSlug: "27-months",
    elgSlug: "masters-degree-or-bachelors-degree-with-5-years-of-work-experience",
    brochureUrl: "/assets/pdf/ggu_dba.pdf",
    featured: true,
    order: 1,
  },
  {
    categorySlug: "doctorate",
    image: "/assets/images/docrorate-2.png",
    logo: "/assets/images/rushford-logo.jpg",
    title: "Doctor of Business Administration",
    slug: "doctor-of-business-administration-rushford",
    uniSlug: "rushford-business-school",
    description:
      "The program empowers executive leadership through Rushford DBA. This elite online DBA delivers strategic advantage through business doctorate online learning, which is globally recognised.",
    durSlug: "36-months",
    elgSlug: "masters-degree-or-bachelors-degree-with-3-years-of-work-experience",
    brochureUrl: "/assets/pdf/rushford_dba.pdf",
    featured: true,
    order: 2,
  },
  {
    categorySlug: "doctorate",
    image: "/assets/images/docrorate-3.png",
    logo: "/assets/images/esgci-logo.jpg",
    title: "Doctor of Business Administration",
    slug: "doctor-of-business-administration-esgci",
    uniSlug: "esgci",
    description:
      "Professionals get an edge to elevate leadership through ESGCI's Online DBA. This business doctorate for working professionals helps them in pursuing executive, elite, strategic growth.",
    durSlug: "36-months",
    elgSlug: "masters-degree-or-bachelor-s-degree-with-3-years-of-work-experience",
    brochureUrl: "/assets/pdf/esgci_dba.pdf",
    featured: false,
    order: 3,
  },
  {
    categorySlug: "doctorate",
    image: "/assets/images/docrorate-4.png",
    logo: "/assets/images/ssbm-logo.jpg",
    title: "Doctor of Business Administration",
    slug: "doctor-of-business-administration-ssbm",
    uniSlug: "ssbm-geneva",
    description:
      "Executives scale their executive leadership through SSBM Geneva Online DBA. This strategic doctorate for working professionals helps in seeking elite doctorate online advancement.",
    durSlug: "36-months",
    elgSlug: "bachelor-s-degree-with-a-minimum-of-5-years-of-experience-or-master-s-degree",
    brochureUrl: "/assets/pdf/ssbm_dba.pdf",
    featured: false,
    order: 4,
  },
  {
    categorySlug: "doctorate",
    image: "/assets/images/docrorate-5.png",
    logo: "/assets/images/edgewood-logo.jpg",
    title: "Doctor of Business Administration",
    slug: "doctor-of-business-administration-edgewood",
    uniSlug: "edgewood-university",
    description:
      "Leaders redefine leadership excellence through Edgewood University Online DBA. This strategic doctorate online for working professionals worldwide enhances their abilities, impacting organisational growth.",
    durSlug: "36-months",
    elgSlug: "master-s-degree",
    brochureUrl: "/assets/pdf/edgewood_dba.pdf",
    featured: false,
    order: 5,
  },
  {
    categorySlug: "doctorate",
    image: "/assets/images/docrorate-6.png",
    logo: "/assets/images/edgewood-logo.jpg",
    title: "MBA + DBA",
    slug: "mba-dba-dual-edgewood",
    uniSlug: "edgewood-university",
    description:
      "Learners accelerate executive leadership through Edgewood University Online MBA + DBA. This combined degree of online DBA and online MBA curates knowledge of business, finance and management.",
    durSlug: "36-months",
    elgSlug: "bachelors-degree",
    brochureUrl: "/assets/pdf/edgewood_dba_mba.pdf",
    featured: true,
    order: 6,
  },
  {
    categorySlug: "certification",
    image: "/assets/images/certification-1.webp",
    logo: "/assets/images/iim-logo.jpg",
    title: "Professional Certificate Programme in HR Management and Analytics",
    slug: "pcp-hr-management-analytics-iim-kozhikode",
    uniSlug: "iim-kozhikode",
    description:
      "The Online HR Analytics helps professionals to gain Hr Analytics certification and gain expertise in workforce decision making and people analytics certification from IIM Kozhikode.",
    durSlug: "6-months",
    elgSlug: "bachelors-degree-min-3-yr-work-exp",
    brochureUrl: "/assets/pdf/iim_main_brochure.pdf",
    featured: true,
    order: 7,
  },
  {
    categorySlug: "certification",
    image: "/assets/images/certification-2.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title: "Professional Certificate Programme in Data Science with Generative AI",
    slug: "pcp-data-science-generative-ai-iiitb",
    uniSlug: "iiit-bangalore",
    description:
      "This Generative AI certification is for early-career professionals who wish to transition through an AI and data science course.",
    durSlug: "6-months",
    elgSlug: "bachelors-or-master-s-degree",
    brochureUrl: "/assets/pdf/IIITB_PCP_in_DS_with_GI.pdf",
    featured: true,
    order: 8,
  },
  {
    categorySlug: "executive",
    image: "/assets/images/executive-1.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title: "Executive Post Graduate Certificate Programme in Data Science & AI",
    slug: "epgc-data-science-ai-iiitb",
    uniSlug: "iiit-bangalore",
    description:
      "This helps to gain credentials in both artificial intelligence certification and data analytics certification, offering in-depth knowledge in Data Science and ML.",
    durSlug: "6-months",
    elgSlug: "bachelors-or-master-s-degree",
    brochureUrl: "/assets/pdf/IIITB_EPGC_DS_AI.pdf",
    featured: false,
    order: 9,
  },
  {
    categorySlug: "executive",
    image: "/assets/images/executive-2.webp",
    logo: "/assets/images/iitkgp-logo.jpg",
    title: "Executive Post Graduate Certificate in Generative AI & Agentic AI",
    slug: "epgc-generative-ai-agentic-ai-iitkgp",
    uniSlug: "iiit-bangalore",
    description:
      "This Generative AI certification is for early-career professionals who wish to transition through an AI and data science course.",
    durSlug: "6-months",
    elgSlug: "bachelors-or-master-s-degree",
    brochureUrl: "/assets/pdf/iitkgp_main_brochure.pdf",
    featured: true,
    order: 10,
  },
  {
    categorySlug: "certification",
    image: "/assets/images/certification-3.webp",
    logo: "/assets/images/mica-logo.jpg",
    title: "Advanced Certificate in Digital Marketing & Communication",
    slug: "advanced-certificate-digital-marketing-mica",
    uniSlug: "mica",
    description:
      "MICA offers an Advanced Certificate, which empowers careers through an online digital marketing course for ambitious learners, gaining a Digital Marketing Certificate.",
    durSlug: "4-months",
    elgSlug: "bachelors-degree",
    brochureUrl: "/assets/pdf/mica_digital_marketing_and_communication.pdf",
    featured: false,
    order: 11,
  },
  {
    categorySlug: "certification",
    image: "/assets/images/certification-4.webp",
    logo: "/assets/images/mica-logo.jpg",
    title: "Advanced Certificate in Digital Brand Communication Strategy",
    slug: "advanced-certificate-brand-communication-mica",
    uniSlug: "mica",
    description:
      "The program strengthens strategic brand management capabilities through MICA's Advanced Certificate, enterprising brand-building course and communication strategy course expertise.",
    durSlug: "7-months",
    elgSlug: "bachelors-degree",
    brochureUrl: "/assets/pdf/mica_digital_brand_communication_strategy.pdf",
    featured: false,
    order: 12,
  },
  {
    categorySlug: "executive",
    image: "/assets/images/executive-3.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title: "Executive Programme in Generative AI for Leaders",
    slug: "executive-programme-generative-ai-leaders-iiitb",
    uniSlug: "iiit-bangalore",
    description:
      "The Generative AI certification is offered in this AI leadership program, enriching professionals with AI for decision-making and empowering AI for business leaders.",
    durSlug: "5-months",
    elgSlug: "bachelor-s-or-master-s-degree-min-4-years-work-experience",
    brochureUrl: "/assets/pdf/iiitb_Executive_Program_in_Generative_AI_for_Leaders.pdf",
    featured: true,
    order: 13,
  },
  {
    categorySlug: "executive",
    image: "http://172.236.183.64:9000/images/2026/07/20/21639f78b1beb5b429790ed43ffd23cc.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title: "Executive Post Graduate Programme in Applied AI and Agentic AI",
    slug: "executive-pgp-applied-ai-agentic-ai-iiitb",
    uniSlug: "iiit-bangalore",
    description:
      "This certification program helps future-ready professionals advance their careers with an agentic AI course and an applied AI course, gaining AI agents certification.",
    durSlug: "30-weeks",
    elgSlug: "bachelor-s-or-master-s-degree",
    brochureUrl: "/assets/pdf/IIITB_Applied_AI_and_Agentic_AI.pdf",
    featured: false,
    order: 14,
  },
  {
    categorySlug: "executive",
    image: "http://172.236.183.64:9000/images/2026/07/20/91c7578b7c5b0304994d774dacf7b689.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title: "Chief Technology Officer & AI Leadership Programme",
    slug: "cto-ai-leadership-programme-iiitb",
    uniSlug: "iiit-bangalore",
    description:
      "The Chief Technology Officer program empowers leaders through a technology management course focused on digital transformation leadership.",
    durSlug: "24-months",
    elgSlug: "bachelor-s-or-master-s-degree-min-8-years-work-experience",
    brochureUrl: "/assets/pdf/IIITB_CTOAI_leadership_program.pdf",
    featured: true,
    order: 15,
  },
  {
    categorySlug: "master",
    image: "/assets/images/master-1.webp",
    logo: "/assets/images/ggu-logo.jpg",
    title: "Master of Business Administration",
    slug: "master-of-business-administration-ggu",
    uniSlug: "golden-gate-university",
    description:
      "This elite educational program of Golden Gate University's online MBA advances careers for working professionals. This features fast track global MBA program with online flexibility and leadership focus development.",
    durSlug: "13-months",
    elgSlug: "bachelor-s-degree",
    brochureUrl: "/assets/pdf/ggu_mba.pdf",
    featured: true,
    order: 16,
  },
  {
    categorySlug: "master",
    image: "/assets/images/master-2.webp",
    logo: "/assets/images/liverpool-logo.png",
    title: "Master of Business Administration",
    slug: "master-of-business-administration-liverpool",
    uniSlug: "liverpool-business-school",
    description:
      "Professionals can accelerate growth through Liverpool Business Schools online MBA, designed for working professionals. It helps in seeking one year executive MBA online with additional months for specialisations, equipping advancement globally.",
    durSlug: "13-months",
    elgSlug: "bachelor-s-degree",
    brochureUrl: "/assets/pdf/ssbm_main_brochure.pdf",
    featured: true,
    order: 17,
  },
  {
    categorySlug: "master",
    image: "/assets/images/master-3.webp",
    logo: "/assets/images/liverpool-iiitb-logo.png",
    title: "M.Sc. Data Science",
    slug: "msc-data-science-ljmu-iiitb",
    uniSlug: "iiit-bangalore",
    description:
      "This program transforms the expertise of learners with LJMU and IITB's Masters in data science. Overall, this MSc Data Science online learning offers industry-ready analytics skills.",
    durSlug: "18-months",
    elgSlug: "bachelor-s-degree",
    brochureUrl: "/assets/pdf/liverpool_mba.pdf",
    featured: false,
    order: 18,
  },
  {
    categorySlug: "master",
    image: "/assets/images/master-4.webp",
    logo: "/assets/images/liverpool-iiitb-logo.png",
    title: "M.Sc. Machine Learning & AI",
    slug: "msc-machine-learning-ai-ljmu-iiitb",
    uniSlug: "iiit-bangalore",
    description:
      "Professionals lead innovation through LJMU and IITB artificial intelligence masters program. This is a blended masters in AI and ML with an advanced skill set and global excellence.",
    durSlug: "18-months",
    elgSlug: "bachelor-s-degree",
    brochureUrl: "/assets/pdf/iiitb_msc_ds.pdf",
    featured: false,
    order: 19,
  },
  {
    categorySlug: "master",
    image: "/assets/images/master-5.webp",
    logo: "/assets/images/iiitb-logo.jpg",
    title: "Executive Diploma in Machine Learning & AI",
    slug: "executive-diploma-machine-learning-ai-iiitb",
    uniSlug: "iiit-bangalore",
    description:
      "This Master program is in emerging technologies and offers expertise in Machine learning through IIIT Bangalore. This artificial intelligence diploma integrates machine learning certification and deep learning course concepts for leadership roles.",
    durSlug: "18-months",
    elgSlug: "bachelors-or-masters-degree",
    brochureUrl: "/assets/pdf/iiitb_msc_ml_ai.pdf",
    featured: false,
    order: 20,
  },
];

async function seedCourses() {
  try {
    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("🔄 Upserting course data with populated Media ObjectIds...");

    const categories = await Category.find({});
    const durations = await Duration.find({});
    const eligibilities = await Eligibility.find({});
    const universities = await University.find({});

    const catMap = new Map(categories.map((c) => [c.slug, c._id]));
    const durMap = new Map(durations.map((d) => [d.slug, d._id]));
    const elgMap = new Map(eligibilities.map((e) => [e.slug, e._id]));
    const uniMap = new Map(universities.map((u) => [u.slug, u._id]));

    for (const p of programsData) {
      const catId = catMap.get(p.categorySlug);
      const durId = durMap.get(p.durSlug);
      const elgId = elgMap.get(p.elgSlug);
      const uniId = uniMap.get(p.uniSlug) || Array.from(uniMap.values())[0];

      const imgMediaId = await findOrCreateMedia(p.image, `${p.title} Image`);
      const logoMediaId = await findOrCreateMedia(p.logo, `${p.title} Logo`);

      const coursePayload = {
        title: p.title,
        slug: p.slug,
        category: catId,
        duration: durId,
        eligibility: elgId,
        university: uniId,
        image: imgMediaId,
        logo: logoMediaId,
        description: p.description,
        brochureUrl: p.brochureUrl,
        featured: p.featured,
        order: p.order,
        enabled: true,
      };

      await Course.findOneAndUpdate(
        { slug: p.slug },
        { $set: coursePayload },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
      console.log(`✅ Synced Course: ${p.title} (${p.slug}) -> Image Media: ${imgMediaId}`);
    }

    console.log("\n🎉 All 20 courses successfully synced with Media ObjectIds!");
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedCourses();
