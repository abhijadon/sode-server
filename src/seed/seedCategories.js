"use strict";

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { Category } = require("../model/Category");
const { Media } = require("../model/Media");
const { uploadFileToMinIO } = require("../service/minio/upload.service");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

const PUBLIC_DIR = path.resolve(__dirname, "../../../client/public");

// Upload local SVG asset to MinIO & save Media document in MongoDB
async function uploadAndCreateMedia(relativePath, altText = "Category Icon") {
  try {
    const cleanPath = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
    const fullPath = path.join(PUBLIC_DIR, cleanPath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Asset file not found: ${fullPath}`);
      return null;
    }

    const originalName = path.basename(fullPath);

    // Check if media already exists in MongoDB
    const existingMedia = await Media.findOne({ name: originalName, removed: false });
    if (existingMedia) {
      return existingMedia._id;
    }

    const mimeType = originalName.endsWith(".svg")
      ? "image/svg+xml"
      : originalName.endsWith(".png")
        ? "image/png"
        : "image/jpeg";

    const fileBuffer = fs.readFileSync(fullPath);

    // Upload asset to MinIO bucket
    const uploadRes = await uploadFileToMinIO(fileBuffer, originalName, mimeType);

    // Save Media record in MongoDB
    const media = await Media.create({
      name: originalName,
      alt: altText,
      url: uploadRes.url,
      bucket: uploadRes.bucket,
      key: uploadRes.key,
      fileName: uploadRes.fileName,
      mimeType: uploadRes.mimeType,
      size: fileBuffer.length,
      enabled: true,
      removed: false,
    });

    console.log(`   ✅ Uploaded MinIO Icon Media: ${originalName} -> ${uploadRes.url}`);
    return media._id;
  } catch (err) {
    console.error(`   ❌ Failed MinIO upload for ${relativePath}:`, err.message);
    return null;
  }
}

async function seedCleanCategories() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    // 1️⃣ Delete all existing categories to start fresh
    await Category.deleteMany({});
    console.log("🗑️ Cleaned up all old categories.");

    // 2️⃣ ROOT CATEGORIES (FOR STATS SECTION, MOCKUP SHOWCASE & LEARNING JOURNEY)
    const rootCategoriesList = [
      {
        name: "Certification",
        slug: "certification",
        type: "course",
        order: 1,
        title: "Executive & Professional Certifications",
        description: "Accelerate your professional growth with specialized certification programs.",
        logoUrl: "assets/images/icons/certification.svg",
        showInStats: true,
        showInMockup: false,
      },
      {
        name: "Diploma",
        slug: "diploma",
        type: "course",
        order: 2,
        title: "Online Post Graduate Diplomas",
        description: "Specialized post graduate diploma courses for working professionals.",
        logoUrl: "assets/images/icons/diploma.svg",
        showInStats: true,
        showInMockup: false,
      },
      {
        name: "Doctorate",
        slug: "doctorate",
        type: "course",
        order: 3,
        title: "Online Doctoral Programs (DBA)",
        description: "Advance your career and develop global leadership skills with prestigious online Doctor of Business Administration (DBA) degrees.",
        logoUrl: "assets/images/icons/doctorate.svg",
        showInStats: true,
        showInMockup: false,
      },
      {
        name: "Master",
        slug: "master",
        type: "course",
        order: 4,
        title: "Online Master's Degrees & MBAs",
        description: "Earn a highly valued online Master's degree or MBA.",
        logoUrl: "assets/images/icons/certification.svg",
        showInStats: true,
        showInMockup: false,
      },
      {
        name: "IIT",
        slug: "iit",
        type: "course",
        order: 5,
        title: "Top IIT Certification Partners",
        description: "Advanced technology, AI & Data Science certification programs from India's premier Indian Institutes of Technology (IITs).",
        logoUrl: "assets/images/icons/doctorate.svg",
        showInStats: true,
        showInMockup: false,
      },
      {
        name: "IIM",
        slug: "iim",
        type: "course",
        order: 6,
        title: "Top IIM Certification Partners",
        description: "Executive management & leadership certification programs from India's premier Indian Institutes of Management (IIMs).",
        logoUrl: "assets/images/icons/certification.svg",
        showInStats: true,
        showInMockup: false,
      },
      {
        name: "Global Universities",
        slug: "global-universities",
        type: "course",
        order: 7,
        title: "Global International Universities",
        description: "World-renowned international degree programs and global university certifications.",
        logoUrl: "assets/images/icons/global-universities.svg",
        showInStats: true,
        showInMockup: false,
      },
      {
        name: "Other",
        slug: "other",
        type: "course",
        order: 8,
        title: "Other Specialized Programs",
        description: "Additional specialized online degrees and skill certifications.",
        logoUrl: "assets/images/icons/other.svg",
        showInStats: true,
        showInMockup: false,
      },
      {
        name: "Browse By Category",
        slug: "browse-by-category",
        type: "course",
        order: 9,
        title: "Browse By Category",
        description: "Domain categories list for pill filter showcase",
        logoUrl: "assets/images/icons/explore.svg",
        showInStats: false,
        showInMockup: false,
      },
      {
        name: "Top Institutes",
        slug: "top-institutes",
        type: "course",
        order: 10,
        title: "Premier Technology, Management & International Universities",
        description: "Explore top IITs, IIMs, and global international universities.",
        logoUrl: "assets/images/icons/doctorate.svg",
        showInStats: false,
        showInMockup: true,
      },
      {
        name: "Learning Journey",
        slug: "learning-journey",
        type: "course",
        order: 11,
        title: "Your Learning Journey",
        description: "Step-by-step career acceleration designed for your dynamic upskilling needs",
        logoUrl: "assets/images/icons/explore.svg",
        showInStats: false,
        showInMockup: false,
      },
    ];

    const createdCategories = [];

    for (const cat of rootCategoriesList) {
      const mediaId = await uploadAndCreateMedia(cat.logoUrl, `${cat.name} Icon`);

      const doc = await Category.create({
        name: cat.name,
        slug: cat.slug,
        type: cat.type,
        enabled: true,
        showInStats: cat.showInStats !== false,
        showInMockup: cat.showInMockup === true,
        order: cat.order,
        title: cat.title,
        description: cat.description,
        logo: mediaId,
        logoSrc: mediaId,
        imageSrc: mediaId,
      });

      createdCategories.push(doc);
      console.log(`✅ Created Root Category: "${cat.name}" (${cat.slug}) -> Stats: ${doc.showInStats}, Mockup: ${doc.showInMockup}`);
    }

    const topInstitutesDoc = createdCategories.find((c) => c.slug === "top-institutes");

    // 3️⃣ SUB-PARENT CATEGORIES UNDER "Top Institutes"
    const subParentsList = [
      {
        name: "Premier Indian Institutes of Technology (IITs)",
        slug: "list-of-iit",
        parentId: topInstitutesDoc?._id,
        order: 1,
        title: "Premier Indian Institutes of Technology (IITs)",
        description: "Explore top IIT certification programs and technical courses.",
        logoUrl: "assets/images/icons/doctorate.svg",
        showInStats: false,
        showInMockup: true,
      },
      {
        name: "Premier Indian Institutes of Management (IIMs)",
        slug: "list-of-iim",
        parentId: topInstitutesDoc?._id,
        order: 2,
        title: "Premier Indian Institutes of Management (IIMs)",
        description: "Explore top executive management programs from premier IIMs.",
        logoUrl: "assets/images/icons/certification.svg",
        showInStats: false,
        showInMockup: true,
      },
      {
        name: "Top Global International Universities",
        slug: "list-of-global-universities",
        parentId: topInstitutesDoc?._id,
        order: 3,
        title: "Top Global International Universities",
        description: "Explore prestigious degree programs from top international universities.",
        logoUrl: "assets/images/icons/global-universities.svg",
        showInStats: false,
        showInMockup: true,
      },
    ];

    for (const subParent of subParentsList) {
      const mediaId = await uploadAndCreateMedia(subParent.logoUrl, `${subParent.name} Icon`);

      const doc = await Category.create({
        name: subParent.name,
        slug: subParent.slug,
        type: "course",
        parentId: subParent.parentId,
        enabled: true,
        showInStats: false,
        showInMockup: true,
        order: subParent.order,
        title: subParent.title,
        description: subParent.description,
        logo: mediaId,
        logoSrc: mediaId,
        imageSrc: mediaId,
      });

      createdCategories.push(doc);
      console.log(`   └─ ✅ Created Sub-Parent under "Top Institutes": "${subParent.name}" (${subParent.slug})`);
    }

    // 4️⃣ ALL SUBCATEGORIES MAPPED PER ROOT / SUB-PARENT CATEGORY
    const subcategoryMap = {
      "browse-by-category": [
        { name: "Management", slug: "browse-management", title: "Management Programs", logoUrl: "assets/tinified (10)/Mangement.png" },
        { name: "AI Courses", slug: "browse-ai-courses", title: "Artificial Intelligence & AI Courses", logoUrl: "assets/tinified (10)/AI Icon.png" },
        { name: "Machine Learning", slug: "browse-machine-learning", title: "Machine Learning Programs", logoUrl: "assets/tinified (10)/Machine-Icon.png" },
        { name: "Human Resource", slug: "browse-human-resource", title: "Human Resource Programs", logoUrl: "assets/images/icons/certification.svg" },
        { name: "Banking", slug: "browse-banking", title: "Banking & Financial Services", logoUrl: "assets/tinified (10)/Banking - icon.png" },
        { name: "Finance", slug: "browse-finance", title: "Finance & Accounting", logoUrl: "assets/tinified (10)/Finace - Icon.png" },
        { name: "Leadership", slug: "browse-leadership", title: "Leadership & Executive Strategy", logoUrl: "assets/tinified (10)/Leadership Icon.png" },
        { name: "Data Science", slug: "browse-data-science", title: "Data Science & Analytics", logoUrl: "assets/tinified (10)/Data Scienece-icon.png" },
      ],
      certification: [
        { name: "AI Courses", slug: "certification-ai-courses", title: "Artificial Intelligence & Generative AI Certifications", logoUrl: "assets/tinified (10)/AI Icon.png" },
        { name: "Data Science", slug: "certification-data-science", title: "Data Science & Analytics Certifications", logoUrl: "assets/tinified (10)/Data Scienece-icon.png" },
        { name: "Human Resource", slug: "certification-human-resource", title: "Human Resource Executive Certifications", logoUrl: "assets/images/icons/certification.svg" },
        { name: "Leadership", slug: "certification-leadership", title: "Executive Leadership Certifications", logoUrl: "assets/tinified (10)/Leadership Icon.png" },
        { name: "Machine Learning", slug: "certification-machine-learning", title: "Machine Learning Certifications", logoUrl: "assets/tinified (10)/Machine-Icon.png" },
        { name: "Management", slug: "certification-management", title: "Business Management Certifications", logoUrl: "assets/tinified (10)/Mangement.png" },
      ],
      diploma: [
        { name: "Machine Learning", slug: "diploma-machine-learning", title: "Machine Learning Post Graduate Diplomas", logoUrl: "assets/tinified (10)/Machine-Icon.png" },
      ],
      doctorate: [
        { name: "AI Courses", slug: "doctorate-ai-courses", title: "AI Doctoral Programs (DBA)", logoUrl: "assets/tinified (10)/AI Icon.png" },
        { name: "Banking", slug: "doctorate-banking", title: "Banking & Financial DBA Programs", logoUrl: "assets/tinified (10)/Banking - icon.png" },
        { name: "Data Science", slug: "doctorate-data-science", title: "Data Science Doctoral Degrees", logoUrl: "assets/tinified (10)/Data Scienece-icon.png" },
        { name: "Finance", slug: "doctorate-finance", title: "Finance Doctoral Programs (DBA)", logoUrl: "assets/tinified (10)/Finace - Icon.png" },
        { name: "Human Resource", slug: "doctorate-human-resource", title: "Human Resource Doctoral Programs (DBA)", logoUrl: "assets/images/icons/doctorate.svg" },
        { name: "Leadership", slug: "doctorate-leadership", title: "Executive Leadership DBA", logoUrl: "assets/tinified (10)/Leadership Icon.png" },
        { name: "Machine Learning", slug: "doctorate-machine-learning", title: "Machine Learning Doctoral Degrees", logoUrl: "assets/tinified (10)/Machine-Icon.png" },
        { name: "Management", slug: "doctorate-management", title: "Doctor of Business Administration (DBA)", logoUrl: "assets/tinified (10)/Mangement.png" },
      ],
      master: [
        { name: "AI Courses", slug: "master-ai-courses", title: "Master's in Artificial Intelligence", logoUrl: "assets/tinified (10)/AI Icon.png" },
        { name: "Data Science", slug: "master-data-science", title: "Master's in Data Science & Analytics", logoUrl: "assets/tinified (10)/Data Scienece-icon.png" },
        { name: "Finance", slug: "master-finance", title: "Master's in Finance & Accounting", logoUrl: "assets/tinified (10)/Finace - Icon.png" },
        { name: "Human Resource", slug: "master-human-resource", title: "Master's in Human Resource Management", logoUrl: "assets/images/icons/certification.svg" },
        { name: "Leadership", slug: "master-leadership", title: "Master's in Leadership & Strategy", logoUrl: "assets/tinified (10)/Leadership Icon.png" },
        { name: "Machine Learning", slug: "master-machine-learning", title: "Master's in Machine Learning", logoUrl: "assets/tinified (10)/Machine-Icon.png" },
        { name: "Management", slug: "master-management", title: "Master of Business Administration (MBA)", logoUrl: "assets/tinified (10)/Mangement.png" },
      ],
      iim: [
        { name: "IIM Kozhikode", slug: "iim-kozhikode", title: "Indian Institute of Management Kozhikode", logoUrl: "assets/Logos png file/IIM Kozhikode.png" },
        { name: "IIM Bangalore", slug: "iim-bangalore", title: "Indian Institute of Management Bangalore", logoUrl: "assets/Logos png file/IIMB.png" },
        { name: "IIM Udaipur", slug: "iim-udaipur", title: "Indian Institute of Management Udaipur", logoUrl: "assets/Logos png file/IIm udaipur.png" },
        { name: "IIM Lucknow", slug: "iim-lucknow", title: "Indian Institute of Management Lucknow", logoUrl: "assets/tinified (10)/IIM Lucknow.png" },
        { name: "IIM Nagpur", slug: "iim-nagpur", title: "Indian Institute of Management Nagpur", logoUrl: "assets/Logos png file/IIM nagpur.png" },
        { name: "IIM Indore", slug: "iim-indore", title: "Indian Institute of Management Indore", logoUrl: "assets/Logos png file/IIM Indore.png" },
      ],
      iit: [
        { name: "IIT Roorkee", slug: "iit-roorkee", title: "Indian Institute of Technology Roorkee", logoUrl: "assets/Logos png file/IIT roorkee.png" },
        { name: "IIT Delhi", slug: "iit-delhi", title: "Indian Institute of Technology Delhi", logoUrl: "assets/Logos png file/IIT delhi.png" },
        { name: "IIT Madras", slug: "iit-madras", title: "Indian Institute of Technology Madras", logoUrl: "assets/Logos png file/IIT Madras.png" },
        { name: "IIIT Bangalore", slug: "iiit-bangalore", title: "International Institute of Information Technology Bangalore", logoUrl: "assets/Logos png file/IIIT Bangalore.png" },
      ],
      "global-universities": [
        { name: "Edgewood University", slug: "edgewood-university", title: "Edgewood University", logoUrl: "assets/tinified (10)/Edgewood.png" },
        { name: "ESGCI, Paris", slug: "esgci-paris", title: "ESGCI, Paris", logoUrl: "assets/Logos png file/ESGCI logo.png" },
        { name: "Golden Gate University", slug: "golden-gate-university", title: "Golden Gate University", logoUrl: "assets/tinified (10)/Golden Gate.png" },
        { name: "Liverpool Business School", slug: "liverpool-business-school", title: "Liverpool Business School", logoUrl: "assets/Logos png file/Liverpool Business School.png" },
        { name: "Paris School of Business", slug: "paris-school-of-business", title: "Paris School of Business", logoUrl: "assets/Logos png file/Paris school of business.png" },
        { name: "Rushford Business School", slug: "rushford-business-school", title: "Rushford Business School", logoUrl: "assets/tinified (10)/Rushford.png" },
        { name: "SSBM Geneva", slug: "ssbm-geneva", title: "SSBM Geneva", logoUrl: "assets/Logos png file/SSBM.png" },
        { name: "XLRI Jamshedpur", slug: "xlri-jamshedpur", title: "XLRI Jamshedpur", logoUrl: "assets/Logos png file/XLRI.png" },
      ],
      "list-of-iit": [
        { name: "IIT Roorkee", slug: "list-iit-roorkee", title: "Indian Institute of Technology Roorkee", logoUrl: "assets/Logos png file/IIT roorkee.png" },
        { name: "IIT Delhi", slug: "list-iit-delhi", title: "Indian Institute of Technology Delhi", logoUrl: "assets/Logos png file/IIT delhi.png" },
        { name: "IIT Madras", slug: "list-iit-madras", title: "Indian Institute of Technology Madras", logoUrl: "assets/Logos png file/IIT Madras.png" },
        { name: "IIIT Bangalore", slug: "list-iiit-bangalore", title: "International Institute of Information Technology Bangalore", logoUrl: "assets/Logos png file/IIIT Bangalore.png" },
      ],
      "list-of-iim": [
        { name: "IIM Kozhikode", slug: "list-iim-kozhikode", title: "Indian Institute of Management Kozhikode", logoUrl: "assets/Logos png file/IIM Kozhikode.png" },
        { name: "IIM Bangalore", slug: "list-iim-bangalore", title: "Indian Institute of Management Bangalore", logoUrl: "assets/Logos png file/IIMB.png" },
        { name: "IIM Udaipur", slug: "list-iim-udaipur", title: "Indian Institute of Management Udaipur", logoUrl: "assets/Logos png file/IIm udaipur.png" },
        { name: "IIM Lucknow", slug: "list-iim-lucknow", title: "Indian Institute of Management Lucknow", logoUrl: "assets/tinified (10)/IIM Lucknow.png" },
        { name: "IIM Nagpur", slug: "list-iim-nagpur", title: "Indian Institute of Management Nagpur", logoUrl: "assets/Logos png file/IIM nagpur.png" },
        { name: "IIM Indore", slug: "list-iim-indore", title: "Indian Institute of Management Indore", logoUrl: "assets/Logos png file/IIM Indore.png" },
      ],
      "list-of-global-universities": [
        { name: "Edgewood University", slug: "list-edgewood-university", title: "Edgewood University", logoUrl: "assets/tinified (10)/Edgewood.png" },
        { name: "ESGCI, Paris", slug: "list-esgci-paris", title: "ESGCI, Paris", logoUrl: "assets/Logos png file/ESGCI logo.png" },
        { name: "Golden Gate University", slug: "list-golden-gate-university", title: "Golden Gate University", logoUrl: "assets/tinified (10)/Golden Gate.png" },
        { name: "Liverpool Business School", slug: "list-liverpool-business-school", title: "Liverpool Business School", logoUrl: "assets/Logos png file/Liverpool Business School.png" },
        { name: "Paris School of Business", slug: "list-paris-school-of-business", title: "Paris School of Business", logoUrl: "assets/Logos png file/Paris school of business.png" },
        { name: "Rushford Business School", slug: "list-rushford-business-school", title: "Rushford Business School", logoUrl: "assets/tinified (10)/Rushford.png" },
        { name: "SSBM Geneva", slug: "list-ssbm-geneva", title: "Swiss School of Business and Management Geneva", logoUrl: "assets/Logos png file/SSBM Geneva.png" },
        { name: "XLRI Jamshedpur", slug: "list-xlri-jamshedpur", title: "XLRI Xavier School of Management", logoUrl: "assets/tinified (10)/XLRI.png" },
      ],
      "learning-journey": [
        { name: "Explore", slug: "journey-explore", title: "Discover programs that fit your career goals", logoUrl: "assets/images/icons/explore.svg" },
        { name: "Learn", slug: "journey-learn", title: "Join live classes & acquire modern skills", logoUrl: "assets/images/icons/learn.svg" },
        { name: "Certify", slug: "journey-certify", title: "Earn globally recognized certifications", logoUrl: "assets/images/icons/certify.svg" },
        { name: "Succeed", slug: "journey-succeed", title: "Get placed & grow your career trajectory", logoUrl: "assets/images/icons/succeed.svg" },
      ],
      other: [
        { name: "Master+Doctorate (Dual)", slug: "master-doctorate-dual", title: "Dual Master + Doctorate Degree Programs", logoUrl: "assets/images/icons/other.svg" },
      ],
    };

    let totalSubcategoriesCount = 0;

    for (const [parentSlug, children] of Object.entries(subcategoryMap)) {
      const parentDoc = createdCategories.find((c) => c.slug === parentSlug);
      if (!parentDoc) continue;

      console.log(`\n🌿 Seeding ${children.length} Subcategories under '${parentDoc.name}'...`);

      let orderIdx = 1;
      for (const child of children) {
        const mediaId = await uploadAndCreateMedia(child.logoUrl, `${child.name} Icon`);

        await Category.create({
          name: child.name,
          slug: child.slug,
          type: "course",
          parentId: parentDoc._id,
          enabled: true,
          showInStats: parentDoc.showInStats,
          showInMockup: parentDoc.showInMockup,
          order: orderIdx++,
          title: child.title,
          logo: mediaId,
          logoSrc: mediaId,
          imageSrc: mediaId,
        });

        totalSubcategoriesCount++;
        console.log(`   └─ ✅ Created Subcategory under "${parentDoc.name}": "${child.name}" (${child.slug})`);
      }
    }

    console.log(`\n🎉 Seed complete! Successfully seeded ${createdCategories.length} parent categories and ${totalSubcategoriesCount} subcategories into MongoDB with MinIO S3 media assets.`);
  } catch (error) {
    console.error("❌ Error in category seed script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedCleanCategories();
