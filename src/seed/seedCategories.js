"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Category } = require("../model/Category");
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

async function seedCleanCategories() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    // 1️⃣ Delete all existing categories to remove any duplicates
    await Category.deleteMany({});
    console.log("🗑️ Cleaned up all old/duplicate categories.");

    // 2️⃣ Categories Array with Parents & Child Categories
    const categoriesList = [
      // 🌟 PARENT CATEGORIES
      {
        name: "Top IIM Certification Partners",
        slug: "top-iim-certification-partners",
        type: "course",
        order: 1,
        title: "Top IIM Certification Partners",
        description: "Executive management & leadership certification programs from India's premier Indian Institutes of Management (IIMs).",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "Top IIT Certification Partners",
        slug: "top-iit-certification-partners",
        type: "course",
        order: 2,
        title: "Top IIT Certification Partners",
        description: "Advanced technology, AI & Data Science certification programs from India's premier Indian Institutes of Technology (IITs).",
        logoUrl: "/assets/images/iiitb-logo.jpg",
      },
      {
        name: "Doctorate",
        slug: "doctorate",
        type: "course",
        order: 3,
        title: "Online Doctoral Programs (DBA)",
        description: "Advance your career and develop global leadership skills with prestigious online Doctor of Business Administration (DBA) degrees.",
        logoUrl: "/assets/images/premium-icon.png",
      },
      {
        name: "Certifications",
        slug: "certification",
        type: "course",
        order: 4,
        title: "Executive & Professional Certifications",
        description: "Accelerate your professional growth with specialized certification programs.",
        logoUrl: "/assets/images/premium-icon.png",
      },
      {
        name: "Executive Programs",
        slug: "executive",
        type: "course",
        order: 5,
        title: "Executive Education Programs",
        description: "Transform your executive leadership capabilities with rigorous programs.",
        logoUrl: "/assets/images/premium-icon.png",
      },
      {
        name: "Master",
        slug: "master",
        type: "course",
        order: 6,
        title: "Online Master's Degrees & MBAs",
        description: "Earn a highly valued online Master's degree or MBA.",
        logoUrl: "/assets/images/premium-icon.png",
      },

      // 🏫 IIM CHILD CATEGORIES (Parent: Top IIM Certification Partners)
      {
        name: "IIM Ahmedabad",
        slug: "iim-ahmedabad",
        type: "course",
        order: 10,
        title: "IIM Ahmedabad Executive Programs",
        description: "Executive General Management & Strategy Programs from IIMA.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Bangalore",
        slug: "iim-bangalore",
        type: "course",
        order: 11,
        title: "IIM Bangalore Digital Transformation",
        description: "Digital Transformation & AI Strategy Programs from IIMB.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Calcutta",
        slug: "iim-calcutta",
        type: "course",
        order: 12,
        title: "IIM Calcutta Corporate Finance",
        description: "Growth Strategies & Corporate Finance Programs from IIMC.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Lucknow",
        slug: "iim-lucknow",
        type: "course",
        order: 13,
        title: "IIM Lucknow Strategic Management",
        description: "Strategic Management & Leadership Programs from IIML.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Kozhikode",
        slug: "iim-kozhikode",
        type: "course",
        order: 14,
        title: "IIM Kozhikode Business Management",
        description: "Business Management & Digital Innovation Programs from IIMK.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Indore",
        slug: "iim-indore",
        type: "course",
        order: 15,
        title: "IIM Indore Executive Leadership",
        description: "Executive Leadership & Brand Management Programs from IIM Indore.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Shillong",
        slug: "iim-shillong",
        type: "course",
        order: 16,
        title: "IIM Shillong Sustainability & Strategy",
        description: "Sustainability & Strategic Management Programs from IIM Shillong.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Rohtak",
        slug: "iim-rohtak",
        type: "course",
        order: 17,
        title: "IIM Rohtak Executive Analytics",
        description: "Executive General Management & Analytics Programs from IIM Rohtak.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Ranchi",
        slug: "iim-ranchi",
        type: "course",
        order: 18,
        title: "IIM Ranchi Human Resources",
        description: "Human Resource & Strategic Leadership Programs from IIM Ranchi.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Raipur",
        slug: "iim-raipur",
        type: "course",
        order: 19,
        title: "IIM Raipur Corporate Governance",
        description: "Corporate Governance & Advanced Business Strategy from IIM Raipur.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Tiruchirappalli",
        slug: "iim-trichy",
        type: "course",
        order: 20,
        title: "IIM Trichy Financial Leadership",
        description: "Financial Leadership & Executive General Management from IIM Trichy.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Udaipur",
        slug: "iim-udaipur",
        type: "course",
        order: 21,
        title: "IIM Udaipur Supply Chain & Analytics",
        description: "Digital Supply Chain Management & Analytics Programs from IIM Udaipur.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Kashipur",
        slug: "iim-kashipur",
        type: "course",
        order: 22,
        title: "IIM Kashipur Operations & Project Management",
        description: "Operations, Logistics & Project Management Programs from IIM Kashipur.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Nagpur",
        slug: "iim-nagpur",
        type: "course",
        order: 23,
        title: "IIM Nagpur Technology Management",
        description: "Technology Management & AI for Executives from IIM Nagpur.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "IIM Visakhapatnam",
        slug: "iim-visakhapatnam",
        type: "course",
        order: 24,
        title: "IIM Visakhapatnam Digital General Management",
        description: "Digital General Management & Innovation Programs from IIM Visakhapatnam.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },

      // 🏫 IIT CHILD CATEGORIES (Parent: Top IIT Certification Partners)
      {
        name: "IIT Delhi",
        slug: "iit-delhi",
        type: "course",
        order: 20,
        title: "IIT Delhi Data Science & ML",
        description: "Data Science & Machine Learning Certifications from IIT Delhi.",
        logoUrl: "/assets/images/iiitb-logo.jpg",
      },
      {
        name: "IIT Bombay",
        slug: "iit-bombay",
        type: "course",
        order: 21,
        title: "IIT Bombay AI & Cloud Computing",
        description: "AI, Machine Learning & Cloud Computing Certifications from IIT Bombay.",
        logoUrl: "/assets/images/iiitb-logo.jpg",
      },
      {
        name: "IIT Madras",
        slug: "iit-madras",
        type: "course",
        order: 22,
        title: "IIT Madras Engineering Analytics",
        description: "Data Science & Engineering Analytics Certifications from IIT Madras.",
        logoUrl: "/assets/images/iiitb-logo.jpg",
      },
      {
        name: "IIT Kanpur",
        slug: "iit-kanpur",
        type: "course",
        order: 23,
        title: "IIT Kanpur Cybersecurity",
        description: "Cybersecurity & Blockchain Technologies Certifications from IIT Kanpur.",
        logoUrl: "/assets/images/iiitb-logo.jpg",
      },
      {
        name: "IIT Roorkee",
        slug: "iit-roorkee",
        type: "course",
        order: 24,
        title: "IIT Roorkee Applied Finance",
        description: "Data Analytics & Applied Finance Certifications from IIT Roorkee.",
        logoUrl: "/assets/images/iiitb-logo.jpg",
      },

      // 🌍 GLOBAL B-SCHOOL PARENT CATEGORY
      {
        name: "Top Global Business Schools",
        slug: "top-global-business-schools",
        type: "course",
        order: 3,
        title: "Top Global Business Schools",
        description: "International executive MBA & leadership programs from top globally ranked B-schools.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },

      // 🌍 GLOBAL B-SCHOOL CHILD CATEGORIES
      {
        name: "Harvard Business School",
        slug: "harvard-business-school",
        type: "course",
        order: 30,
        title: "Harvard Executive Leadership",
        description: "Global Senior Executive Leadership Program from Harvard Business School.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "INSEAD",
        slug: "insead",
        type: "course",
        order: 31,
        title: "INSEAD International Management",
        description: "Global Executive MBA & Strategy Certification from INSEAD.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "Wharton School",
        slug: "wharton-school",
        type: "course",
        order: 32,
        title: "Wharton General Management",
        description: "Advanced Finance & Corporate Strategy Program from Wharton.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "London Business School",
        slug: "london-business-school",
        type: "course",
        order: 33,
        title: "LBS Global Executive Education",
        description: "Leadership & Digital Disruption Certification from London Business School.",
        logoUrl: "/assets/images/iim-logo.jpg",
      },
      {
        name: "MIT Sloan",
        slug: "mit-sloan",
        type: "course",
        order: 34,
        title: "MIT Sloan AI & Innovation",
        description: "Artificial Intelligence & Technological Innovation Certification from MIT Sloan.",
        logoUrl: "/assets/images/iiitb-logo.jpg",
      },

      // 🎓 DOCTORATE CHILD CATEGORIES (Parent: Doctorate)
      {
        name: "DBA Programs",
        slug: "dba-programs",
        type: "course",
        order: 40,
        title: "Doctor of Business Administration (DBA)",
        description: "Specialized Doctor of Business Administration domain categories.",
        logoUrl: "/assets/images/premium-icon.png",
      },
      {
        name: "Executive PhD",
        slug: "executive-phd",
        type: "course",
        order: 41,
        title: "Executive PhD in Management",
        description: "Research domains in executive management and leadership.",
        logoUrl: "/assets/images/premium-icon.png",
      },
      {
        name: "Doctor of Management",
        slug: "doctor-of-management",
        type: "course",
        order: 42,
        title: "Doctor of Management Category",
        description: "Doctoral research in organizational management.",
        logoUrl: "/assets/images/premium-icon.png",
      },

      // 🎓 NESTED SUB-CHILDREN (Parent: DBA Programs)
      {
        name: "European DBA",
        slug: "european-dba",
        type: "course",
        order: 43,
        title: "European Accredited DBA Programs",
        description: "DBA specialization categories awarded by European universities.",
        logoUrl: "/assets/images/premium-icon.png",
      },
      {
        name: "US DBA",
        slug: "us-dba",
        type: "course",
        order: 44,
        title: "US Accredited DBA Degrees",
        description: "DBA specialization categories accredited by US accreditation bodies.",
        logoUrl: "/assets/images/premium-icon.png",
      },
    ];

    const categoryMap = new Map();

    for (const cat of categoriesList) {
      const mediaId = await findOrCreateMedia(cat.logoUrl, `${cat.name} Logo`);

      const doc = await Category.create({
        name: cat.name,
        slug: cat.slug,
        type: cat.type,
        enabled: true,
        order: cat.order,
        title: cat.title,
        description: cat.description,
        logo: mediaId,
        logoSrc: mediaId,
        imageSrc: mediaId,
      });
      categoryMap.set(cat.slug, doc);
      console.log(`✅ Created Category: "${cat.name}" (${cat.slug}) [Order: ${cat.order}]`);
    }

    // Link parent-child category relationships
    const parentRelations = [
      { childSlug: "iim-ahmedabad", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-bangalore", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-calcutta", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-lucknow", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-kozhikode", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-indore", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-shillong", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-rohtak", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-ranchi", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-raipur", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-trichy", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-udaipur", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-kashipur", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-nagpur", parentSlug: "top-iim-certification-partners" },
      { childSlug: "iim-visakhapatnam", parentSlug: "top-iim-certification-partners" },

      { childSlug: "iit-delhi", parentSlug: "top-iit-certification-partners" },
      { childSlug: "iit-bombay", parentSlug: "top-iit-certification-partners" },
      { childSlug: "iit-madras", parentSlug: "top-iit-certification-partners" },
      { childSlug: "iit-kanpur", parentSlug: "top-iit-certification-partners" },
      { childSlug: "iit-roorkee", parentSlug: "top-iit-certification-partners" },

      { childSlug: "harvard-business-school", parentSlug: "top-global-business-schools" },
      { childSlug: "insead", parentSlug: "top-global-business-schools" },
      { childSlug: "wharton-school", parentSlug: "top-global-business-schools" },
      { childSlug: "london-business-school", parentSlug: "top-global-business-schools" },
      { childSlug: "mit-sloan", parentSlug: "top-global-business-schools" },

      // Doctorate Children
      { childSlug: "dba-programs", parentSlug: "doctorate" },
      { childSlug: "executive-phd", parentSlug: "doctorate" },
      { childSlug: "doctor-of-management", parentSlug: "doctorate" },

      // Sub-children under DBA Programs
      { childSlug: "european-dba", parentSlug: "dba-programs" },
      { childSlug: "us-dba", parentSlug: "dba-programs" },
    ];

    for (const rel of parentRelations) {
      const childDoc = categoryMap.get(rel.childSlug);
      const parentDoc = categoryMap.get(rel.parentSlug);
      if (childDoc && parentDoc) {
        await Category.updateOne(
          { _id: childDoc._id },
          { $set: { parentId: parentDoc._id } }
        );
        console.log(`🔗 Linked Parent: "${rel.childSlug}" parentId -> "${rel.parentSlug}"`);
      }
    }

    const doctorateCat = categoryMap.get("doctorate");
    const executiveCat = categoryMap.get("executive");
    const certificationCat = categoryMap.get("certification");
    const masterCat = categoryMap.get("master");
    const topGlobalCat = categoryMap.get("top-global-business-schools");

    // 5️⃣ Clean all existing category references on courses & universities
    await mongoose.connection.db.collection("courses").updateMany({}, { $unset: { category: "" } });
    await mongoose.connection.db.collection("partnercourses").updateMany({}, { $unset: { category: "" } });
    await mongoose.connection.db.collection("universities").updateMany({}, { $unset: { category: "", categories: "" } });
    await mongoose.connection.db.collection("partneruniversities").updateMany({}, { $unset: { category: "", categories: "" } });

    const iimAhmedabadCat = categoryMap.get("iim-ahmedabad");
    const iimBangaloreCat = categoryMap.get("iim-bangalore");
    const iimCalcuttaCat = categoryMap.get("iim-calcutta");
    const iimLucknowCat = categoryMap.get("iim-lucknow");
    const iitDelhiCat = categoryMap.get("iit-delhi");

    const dbaProgramsCat = categoryMap.get("dba-programs");
    const executivePhdCat = categoryMap.get("executive-phd");
    const doctorOfManagementCat = categoryMap.get("doctor-of-management");
    const europeanDbaCat = categoryMap.get("european-dba");
    const usDbaCat = categoryMap.get("us-dba");

    // 6️⃣ Re-map courses to specific test categories
    const rawCourses = await mongoose.connection.db.collection("courses").find({}).toArray();

    for (let i = 0; i < rawCourses.length; i++) {
      const rawCourse = rawCourses[i];
      const titleLower = String(rawCourse.title || "").toLowerCase();
      let targetCat = masterCat;

      if (titleLower.includes("doctor") || titleLower.includes("dba") || titleLower.includes("phd")) {
        // Map Doctorate courses to Subcategories (DBA Programs / Executive PhD / European DBA / US DBA)
        if (titleLower.includes("european") || titleLower.includes("geneva")) {
          targetCat = europeanDbaCat || dbaProgramsCat;
        } else if (titleLower.includes("us") || titleLower.includes("gate")) {
          targetCat = usDbaCat || dbaProgramsCat;
        } else if (titleLower.includes("phd")) {
          targetCat = executivePhdCat || dbaProgramsCat;
        } else if (titleLower.includes("management")) {
          targetCat = doctorOfManagementCat || dbaProgramsCat;
        } else {
          targetCat = dbaProgramsCat;
        }
      } else if (i === 0 && iimAhmedabadCat) {
        // IIM Ahmedabad = BOTH Courses + University
        targetCat = iimAhmedabadCat;
      } else if (i === 1 && iimCalcuttaCat) {
        // IIM Calcutta = Courses ONLY
        targetCat = iimCalcuttaCat;
      } else if (titleLower.includes("executive") || titleLower.includes("cto")) {
        // Executive = BOTH
        targetCat = executiveCat;
      } else {
        targetCat = certificationCat;
      }

      if (targetCat) {
        await mongoose.connection.db.collection("courses").updateOne(
          { _id: rawCourse._id },
          { $set: { category: targetCat._id }, $addToSet: { categories: targetCat._id } }
        );
        await mongoose.connection.db.collection("partnercourses").updateMany(
          { course: rawCourse._id },
          { $set: { category: targetCat._id }, $addToSet: { categories: targetCat._id } }
        );
      }
    }

    // 7️⃣ Map & Upsert Universities and PartnerUniversities cleanly for partner test cases:
    const uniTestConfigs = [
      { slug: "iim-ahmedabad", catDoc: iimAhmedabadCat, name: "IIM Ahmedabad" },
      { slug: "iim-bangalore", catDoc: iimBangaloreCat, name: "IIM Bangalore" },
      { slug: "iit-delhi", catDoc: iitDelhiCat, name: "IIT Delhi" },
      { slug: "harvard-business-school", catDoc: topGlobalCat, name: "Harvard Business School" },
      { slug: "insead", catDoc: topGlobalCat, name: "INSEAD" },
      { slug: "wharton-school", catDoc: topGlobalCat, name: "Wharton School" },
      { slug: "ssbm-geneva", catDoc: europeanDbaCat || dbaProgramsCat, name: "SSBM Geneva" },
      { slug: "golden-gate-university", catDoc: usDbaCat || dbaProgramsCat, name: "Golden Gate University" },
      { slug: "rushford-business-school", catDoc: dbaProgramsCat, name: "Rushford Business School" },
      { slug: "esgc-paris", catDoc: executivePhdCat, name: "ESGC Paris" },
      { slug: "edgewood-university", catDoc: doctorOfManagementCat, name: "Edgewood University" },
    ];

    for (const cfg of uniTestConfigs) {
      if (!cfg.catDoc) continue;
      const mediaId = await findOrCreateMedia("/assets/images/iim-logo.jpg", `${cfg.slug} Logo`);
      const uName = cfg.name || cfg.catDoc.name || cfg.slug.toUpperCase();

      // Upsert Base University Document
      let uniDoc = await mongoose.connection.db.collection("universities").findOne({
        $or: [{ slug: cfg.slug }, { name: new RegExp(cfg.slug.replace(/-/g, ".*"), "i") }]
      });

      if (!uniDoc) {
        const insRes = await mongoose.connection.db.collection("universities").insertOne({
          name: uName,
          slug: cfg.slug,
          logoSrc: mediaId,
          imageSrc: mediaId,
          category: cfg.catDoc._id,
          categories: [cfg.catDoc._id],
          enabled: true,
          removed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        uniDoc = { _id: insRes.insertedId, name: uName };
      } else {
        await mongoose.connection.db.collection("universities").updateOne(
          { _id: uniDoc._id },
          { $set: { category: cfg.catDoc._id }, $addToSet: { categories: cfg.catDoc._id } }
        );
      }

      // Upsert PartnerUniversity Document
      let puDoc = await mongoose.connection.db.collection("partneruniversities").findOne({
        $or: [{ university: uniDoc._id }, { slug: cfg.slug }, { name: new RegExp(cfg.slug.replace(/-/g, ".*"), "i") }]
      });

      if (!puDoc) {
        await mongoose.connection.db.collection("partneruniversities").insertOne({
          university: uniDoc._id,
          name: uName,
          slug: cfg.slug,
          category: cfg.catDoc._id,
          categories: [cfg.catDoc._id],
          location: "India / Global",
          type: "Autonomous Institute",
          rating: 4.9,
          enabled: true,
          removed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        await mongoose.connection.db.collection("partneruniversities").updateOne(
          { _id: puDoc._id },
          { $set: { category: cfg.catDoc._id }, $addToSet: { categories: cfg.catDoc._id } }
        );
      }
    }

    console.log(`🎉 Seed complete!
    • IIM Ahmedabad: BOTH (Courses + Universities)
    • IIM Bangalore: ONLY Universities (1 University, 0 Courses)
    • IIM Calcutta: ONLY Courses (1-2 Courses, 0 Universities)
    • IIM Lucknow: NONE / EMPTY (0 Universities, 0 Courses)
    • IIT Delhi: ONLY Universities (1 University, 0 Courses)
    • Doctorate: ONLY Courses
    • Top Global B-Schools: ONLY Universities`);
  } catch (error) {
    console.error("❌ Error in category seed script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedCleanCategories();
