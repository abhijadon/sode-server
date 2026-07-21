"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { University } = require("../model/University");
const { PartnerUniversity } = require("../model/PartnerUniversity");
const { Course } = require("../model/Course");
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

const universitiesData = [
  {
    name: "Rushford Business School",
    slug: "rushford-business-school",
    logoSrc: "/assets/images/rushford-logo.jpg",
    imageSrc: "/assets/images/rushford-image.png",
    courses: ["Rushford DBA"],
    brochureUrl: "/assets/pdf/rushford_main_brochure.pdf",
    paragraphs: [
      "Rushford Business School is a globally recognised institute having 5 star QS rating, AACSB-accredited and an active member of ACBSP (Accreditation Council for Business Schools and Programs ). This institution offers flexible and accessible executive leadership education for working professionals, providing them with the expertise for C-suite roles.",
      "Rushford DBA program is designed for senior managers, entrepreneurs, and consultants looking to strengthen their proficiency in business research, innovation, and strategic leadership. It is an eduQua-certified business school located in Switzerland.",
      "The program emphasises global business challenges. It is equipped with evidence-based decision-making and leadership transformation skillset. Overall, it helps learners prepare for executive and board-level responsibilities in an increasingly digital and AI-powered business environment.",
    ],
    order: 1,
    featured: true,
  },
  {
    name: "Golden Gate University",
    slug: "golden-gate-university",
    logoSrc: "/assets/images/ggu-logo.jpg",
    imageSrc: "/assets/images/ggu-image.png",
    courses: ["Online DBA", "Online MBA"],
    brochureUrl: "/assets/pdf/ggu_main_brochure.pdf",
    paragraphs: [
      "Golden Gate University is a respected institution which is located in San Francisco, California. The university is WES recognised and AACSB accredited, therefore is known worldwide for its strong industry orientation and practitioner-led business education. Over the span, the university has been a pioneering institute for several professional enterprise executive education programs.",
      "This university offers an Online DBA designed for experienced professionals seeking research expertise and leadership capabilities. The university curates an advanced Online MBA focused on strategic management and global business practices.",
      "The programs Golden Gate MBA and Golden Gate University Online DBA are particularly suitable for learners who are searching for executive management programs. The flexible learning formats, U.S. faculty with Fortune 500 experiences and a curriculum aligned with executive leadership requirements, Golden Gate Admissions supports executives aiming for senior management and C-suite roles.",
    ],
    order: 2,
    featured: true,
  },
  {
    name: "SSBM Geneva",
    slug: "ssbm-geneva",
    logoSrc: "/assets/images/ssbm-logo.jpg",
    imageSrc: "/assets/images/ssbm-image.png",
    courses: ["Online DBA"],
    brochureUrl: "/assets/pdf/ssbm_main_brochure.pdf",
    paragraphs: [
      "The Swiss School of Business and Management (SSBM), based in Geneva, Switzerland, is known for its modern and internationally focused executive education. The university holds a membership of  AAACSB and is accredited by top British, Swiss and U.S agencies, making it globally recognised.",
      "SSBM Online DBA program is designed specifically for working professionals and business leaders seeking doctoral-level expertise without interrupting their careers.",
      "SSBM's doctorate program curates a strong global business perspective and flexible online delivery. SSBM prepares learners to address real-world business challenges and lead organisational transformation. The elite educational program is particularly attractive to professionals targeting senior leadership and advisory positions.",
    ],
    order: 3,
    featured: true,
  },
  {
    name: "ESGCI",
    slug: "esgci",
    logoSrc: "/assets/images/esgci-logo.jpg",
    imageSrc: "/assets/images/esgci-image.png",
    courses: ["Online DBA"],
    brochureUrl: "/assets/pdf/esgci_main_brochure.pdf",
    paragraphs: [
      "The university is based in Paris, France. ESGCI is a recognised business school known for delivering a high-end career-oriented management education, which has been recognised under the French Ministry of Higher Education, offering it with an excellence in a global outlook.",
      "ESGCI Online DBA is a fast-track program tailored for experienced professionals seeking advanced business knowledge while continuing their careers.",
      "The flexible learning pathways and a global perspective, ESGCI's doctorate supports executives aspiring to contribute to business thought leadership, solve complex organisational challenges and be independent veterans.",
    ],
    order: 4,
    featured: false,
  },
  {
    name: "Edgewood University",
    slug: "edgewood-university",
    logoSrc: "/assets/images/edgewood-logo.jpg",
    imageSrc: "/assets/images/edgewood-image.png",
    courses: ["Online DBA", "MBA + DBA"],
    brochureUrl: "/assets/pdf/edgewood_main_brochure.pdf",
    paragraphs: [
      "Edgewood is a globally recognised university located in Madison, Wisconsin. The university is one of the top institutions that holds accreditations from ACBSP and HL and is WES recognised, offering an edge to its programs through its learner-centric approach and emphasis on leadership development.",
      "The institution offers both an Online DBA and an integrated MBA + DBA pathway for ambitious professionals who seek accelerated career progression. These programs combine managerial knowledge with doctoral research capabilities, enabling learners to develop expertise in strategy, innovation, and organisational leadership.",
      "The flexible structure and global excellence make this institution particularly appealing to executives pursuing long-term leadership ambitions.",
    ],
    order: 5,
    featured: true,
  },
  {
    name: "Liverpool Business School",
    slug: "liverpool-business-school",
    logoSrc: "/assets/images/liverpool-logo.png",
    imageSrc: "/assets/images/liverpool-image.png",
    courses: ["MBA Online"],
    brochureUrl: "/assets/pdf/liverpool_main_brochure.pdf",
    paragraphs: [
      "Liverpool Business School is part of a prestigious UK university ecosystem and delivers globally recognised management education with a strong focus on leadership and employability. This institute is under Liverpool John Moores University and is known for its 30+ years of excellence in business education.",
      "Liverpool Online Courses are the most sought-after options for professionals who seek an opportunity to have a global outlook and elite enterprise educational programs.",
      "The Liverpool MBA Online program is recognised by the World Education Services (WES) and is AACSB-accredited, equipping students with deep knowledge in Finance and Management. The flexible online learning format and international faculty make the program ideal for aspiring managers and business leaders, executives who are all aiming to strengthen their decision-making capabilities.",
    ],
    order: 6,
    featured: true,
  },
  {
    name: "IIIT Bangalore",
    slug: "iiit-bangalore",
    logoSrc: "/assets/images/iiitb-logo.jpg",
    imageSrc: "/assets/images/iiitb-image.png",
    courses: [
      "Data Science",
      "CTO Leader Program",
      "Generative AI",
      "Artificial Intelligence",
      "Agentic AI",
      "Machine Learning",
    ],
    brochureUrl: "/assets/pdf/iiitb_main_brochure.pdf",
    paragraphs: [
      "IIIT Bangalore is a premier institute in India that is known for its executive management certification course. It is a technology-focused institution holding NAAC accreditation and is widely respected for its industry-aligned executive education.",
      "The institute offers a range of programs and IIIT Certification, including the Executive Programme in Generative AI for Leaders, Executive Post Graduate Certificate Programme in Data Science & AI, and AI leadership programs. The IIIT Bangalore Online programs combine technical expertise with leadership development. It guides professionals in building capabilities in AI, machine learning, agentic AI, and digital transformation for future leadership roles.",
    ],
    order: 7,
    featured: true,
  },
  {
    name: "IIM Kozhikode",
    slug: "iim-kozhikode",
    logoSrc: "/assets/images/iim-logo.jpg",
    imageSrc: "/assets/images/iim-image.png",
    courses: [
      "Professional Certificate Programme in HR Management and Analytics",
    ],
    brochureUrl: "/assets/pdf/iim_main_brochure.pdf",
    paragraphs: [
      "IIM Kozhikode is located in Kerala. It is one of India's leading management institutes and is widely recognised for its academic excellence and executive education initiatives. The institute offers the Professional Certificate Programme in HR Management and Analytics, combining people management with data-driven decision-making capabilities.",
      "This IIM Executive Program is highly relevant for HR professionals searching for, IIM Executive Education opportunities to enhance their abilities for workforce management. Profess through IIM Kozhikode Online, gain expertise in workforce analytics, talent strategy, and organisational effectiveness, preparing them for modern HR leadership roles in digitally transforming organisations.",
    ],
    order: 8,
    featured: true,
  },
  {
    name: "Liverpool John Moores University",
    slug: "liverpool-john-moores-university",
    logoSrc: "/assets/images/ljmu-logo.png",
    imageSrc: "/assets/images/liverpool-image.png",
    courses: ["LJMU MSc", "LJMU MBA"],
    brochureUrl: "/assets/pdf/liverpool_main_brochure.pdf",
    paragraphs: [
      "Liverpool John Moores University (LJMU) is a reputed university in the UK which known for its excellence in executive leadership programs. The university holds prestigious recognitions accreditations, including WES (World Education Services), AACSB (Association to Advance Collegiate Schools of Business), and Privy Council Accreditation, reinforcing the global acceptance and credibility of its qualifications.",
      "It offers a lot of future-focused programmes, such as a Masters in Data Science and a Masters in Machine Learning and AI. These are tailored to equip professionals with advanced analytical, AI, and technological capabilities. LJMU combines academic rigour with practical learning to prepare leaders for the digital economy.",
    ],
    order: 9,
    featured: false,
  },
  {
    name: "MICA",
    slug: "mica",
    logoSrc: "/assets/images/mica-logo.jpg",
    imageSrc: "/assets/images/mica-image.png",
    courses: [
      "Digital Marketing",
      "SEO & SEM",
      "Brand Communication",
      "Social Media",
    ],
    brochureUrl: "/assets/pdf/mica_main_brochure.pdf",
    paragraphs: [
      "MICA is one of India's premier institutions, established in 1991 at Ahmedabad, Gujarat . The institute specialises in strategic marketing, branding, and communications educational programs and certifications.",
      "The institute offers the Advanced Certificate in Digital Marketing & Communication and the Advanced Certificate in Digital Brand Communication Strategy. Through MICA Admissions, Professionals learn MICA Digital Marketing Programs. The executive management programs are tailored to consumer behaviour, performance marketing, brand strategy, and digital communication. This enables learners to build expertise in modern marketing leadership and customer engagement strategies in a digital-first economy.",
    ],
    order: 10,
    featured: true,
  },
  {
    name: "Subharti University",
    slug: "subharti-university",
    logoSrc: "/assets/images/subharti-logo.jpg",
    imageSrc: "/assets/images/subharti-image.jpg",
    courses: ["Online MBA", "Online BBA", "Online BA", "Online MA"],
    brochureUrl: "/assets/pdf/subharti_brochure.pdf",
    location: "Meerut, UP, India",
    established: "2008",
    approvals: ["UGC-DEB Approved", "NAAC A Grade", "AICTE"],
    rating: 4.5,
    reviewsCount: 845,
    examMode: "Online / Assignment-Based",
    emiStarts: "₹2,999/month",
    paragraphs: [
      "Swami Vivekanand Subharti University is a top State Private University offering high-quality distance education courses approved by UGC-DEB.",
      "The university focuses on making higher education flexible, affordable, and accessible for working professionals across India.",
    ],
    order: 11,
    featured: true,
  },
  {
    name: "Mangalayatan University",
    slug: "mangalayatan-university",
    logoSrc: "/assets/images/mangalayatan-logo.jpg",
    imageSrc: "/assets/images/mangalayatan-image.jpg",
    courses: ["Online MCA", "Online BCA", "Online MBA"],
    brochureUrl: "/assets/pdf/mangalayatan_brochure.pdf",
    location: "Aligarh, UP, India",
    established: "2006",
    approvals: ["UGC-DEB Approved", "NAAC A+ Grade", "AICTE"],
    rating: 4.6,
    reviewsCount: 620,
    examMode: "100% Online",
    emiStarts: "₹3,499/month",
    paragraphs: [
      "Mangalayatan University is a premier NAAC A+ accredited institution offering career-oriented online degree programs.",
      "Programs are designed with academic flexibility and industry-relevant syllabus for modern working professionals.",
    ],
    order: 12,
    featured: true,
  },
];

async function seedUniversitiesAndPartners() {
  try {
    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("🧹 Dropping partneruniversities indexes & clearing old fields...");
    try {
      await mongoose.connection.db.collection("partneruniversities").dropIndexes();
    } catch (e) {}

    await PartnerUniversity.deleteMany({});
    console.log("🗑️ Cleaned up partneruniversities collection.");

    for (const item of universitiesData) {
      const logoMediaId = await findOrCreateMedia(item.logoSrc, `${item.name} Logo`);
      const imageMediaId = await findOrCreateMedia(item.imageSrc, `${item.name} Image`);

      // 1️⃣ Upsert in University model (ONLY clean fields: name, slug, logoSrc, imageSrc, order, enabled)
      const uniDoc = await University.findOneAndUpdate(
        { slug: item.slug },
        {
          $set: {
            name: item.name,
            slug: item.slug,
            logoSrc: logoMediaId,
            imageSrc: imageMediaId,
            order: item.order,
            enabled: true,
          },
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );

      // Resolve Course ObjectIds from master Course collection
      const courseObjectIds = [];
      if (Array.isArray(item.courses) && item.courses.length > 0) {
        for (const courseTitle of item.courses) {
          const cleanSlug = courseTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          let courseDoc = await Course.findOne({
            $or: [
              { title: new RegExp(`^${courseTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
              { slug: cleanSlug },
            ],
          });
          if (!courseDoc) {
            courseDoc = await Course.create({
              title: courseTitle,
              slug: cleanSlug,
              enabled: true,
            });
          }
          courseObjectIds.push(courseDoc._id);
        }
      }

      // 2️⃣ Create in PartnerUniversity model (strictly linked to University._id and Course._ids)
      await PartnerUniversity.create({
        university: uniDoc._id,
        courses: courseObjectIds,
        brochureUrl: item.brochureUrl,
        paragraphs: item.paragraphs,
        location: item.location || "India / Global",
        established: item.established || "2000",
        approvals: item.approvals || ["UGC", "DEB", "WES", "AICTE"],
        rating: item.rating || 4.8,
        reviewsCount: item.reviewsCount || 350,
        examMode: item.examMode || "100% Online / Assignment-Based",
        emiStarts: item.emiStarts || "₹4,999/month",
        order: item.order,
        featured: item.featured,
        enabled: true,
      });

      console.log(`✅ Synced Clean University & PartnerUniversity: ${item.name} (${uniDoc._id}) with ${courseObjectIds.length} course ObjectIds`);
    }

    console.log("\n🎉 All universities and partner universities successfully cleaned and synced!");
  } catch (error) {
    console.error("❌ Error seeding universities:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedUniversitiesAndPartners();
