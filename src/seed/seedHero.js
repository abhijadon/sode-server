"use strict";

/**
 * Seed Hero Section using EXISTING MinIO Media ObjectIDs for Desktop & Mobile Banners
 * Run: node src/seed/seedHero.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const { Hero } = require("../model/Hero");
const { Media } = require("../model/Media");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode";

async function getExistingMediaId(namePattern) {
  const media = await Media.findOne({
    name: { $regex: namePattern },
    removed: false,
  });

  if (media) {
    console.log(`🔍 Found MinIO Media: "${media.name}" (${media._id}) -> ${media.url}`);
    return media._id;
  }

  console.warn(`⚠️ Warning: Media matching "${namePattern}" not found.`);
  return null;
}

async function seedHero() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }

    console.log("🔍 Fetching Desktop & Mobile MinIO Media ObjectIDs from MongoDB...");

    // ── Desktop Banner Media ObjectIDs ─────────────────────────────────────────
    const desktopBannerId =
      (await getExistingMediaId(/desktop banner\.webp/i)) ||
      (await getExistingMediaId(/desktop/i));

    const gguDesktopId =
      (await getExistingMediaId(/ggu_desktop_new_bg/i)) || desktopBannerId;

    const iiitbDesktopId =
      (await getExistingMediaId(/iiitb_desktop_new_bg/i)) || desktopBannerId;

    const iimDesktopId =
      (await getExistingMediaId(/iim_desktop_new_img/i)) || desktopBannerId;

    // ── Mobile Banner Media ObjectIDs ──────────────────────────────────────────
    const mainMobileId =
      (await getExistingMediaId(/mobile-banner-img\.png/i)) ||
      (await getExistingMediaId(/mobile-banner/i));

    const gguMobileId =
      (await getExistingMediaId(/ggu_mobile_img/i)) || mainMobileId;

    const iiitbMobileId =
      (await getExistingMediaId(/iiitb_mobile_new_img/i)) || mainMobileId;

    console.log("🌱 Seeding Hero Sections into Database...");

    const heroSeedData = [
      {
        name: "Home Page Primary Hero",
        page: "home",
        isCarousel: true,
        enabled: true,
        removed: false,

        // Single Banner Data (Desktop + Mobile Media References)
        badge: "#1 School of Online & Distance Education",
        title: "Certifications & Online Degree Courses from IITs, IIMs & Leading Global B-Schools",
        subtitle: "Your Gateway to Strategic Leadership Program Learning from Leading Institutions.",
        description: "Discover top-rated online degrees, executive MBAs, DBAs, and certification programs tailored for working professionals and leaders.",
        primaryCtaText: "Book 1:1 Personalised Counselling",
        primaryCtaLink: "#counselling",

        bgImage: desktopBannerId,      // 🖥️ Desktop Background Media ObjectId
        mobileImage: mainMobileId,     // 📱 Mobile Counselor Media ObjectId

        // Carousel Config
        carouselSettings: {
          autoplay: true,
          autoplaySpeed: 5000,
          effect: "slide",
          showDots: true,
          showArrows: true,
        },

        // Carousel Slides with distinct Desktop & Mobile Media ObjectIDs
        slides: [
          {
            badge: "#1 School of Online & Distance Education",
            title: "Certifications & Online Degree Courses from IITs, IIMs & Leading Global B-Schools",
            subtitle: "Gateway to Strategic Leadership Programs",
            description: "Your Gateway to Strategic Leadership Program Learning from Leading Institutions.",
            primaryCtaText: "Book 1:1 Personalised Counselling",
            primaryCtaLink: "#counselling",
            secondaryCtaText: "Explore Programs",
            secondaryCtaLink: "/courses",

            bgImage: desktopBannerId,   // 🖥️ Slide 1 Desktop Media
            mobileImage: mainMobileId,  // 📱 Slide 1 Mobile Media

            order: 1,
            enabled: true,
          },
          {
            badge: "GLOBAL ACCREDITED DEGREES",
            title: "Earn Executive Doctorates & DBAs From Top European & US Universities",
            subtitle: "WES Recognised & AACSB Accredited",
            description: "Flexible doctoral programs designed for senior executives, business leaders, and consultants without pausing your career.",
            primaryCtaText: "Explore DBA Programs",
            primaryCtaLink: "/universities",
            secondaryCtaText: "Get Free Brochure",
            secondaryCtaLink: "#brochure",

            bgImage: gguDesktopId,      // 🖥️ Slide 2 Desktop Media
            mobileImage: gguMobileId,   // 📱 Slide 2 Mobile Media

            order: 2,
            enabled: true,
          },
          {
            badge: "AI & DATA LEADERSHIP",
            title: "Executive AI & Data Science Certification Programs from IIIT Bangalore",
            subtitle: "Master Generative AI & Digital Transformation",
            description: "Equip yourself with high-demand AI skills, machine learning expertise, and strategic leadership capabilities for the digital era.",
            primaryCtaText: "View AI Courses",
            primaryCtaLink: "/courses",
            secondaryCtaText: "Talk to Expert",
            secondaryCtaLink: "#counselling",

            bgImage: iiitbDesktopId,    // 🖥️ Slide 3 Desktop Media
            mobileImage: iiitbMobileId, // 📱 Slide 3 Mobile Media

            order: 3,
            enabled: true,
          },
        ],
        order: 1,
      },
      {
        name: "Universities Page Banner",
        page: "universities",
        isCarousel: false,
        enabled: true,
        removed: false,

        badge: "GLOBAL PARTNERSHIPS",
        title: "Explore Top UGC-DEB & WES Approved Partner Universities",
        subtitle: "Compare & Choose the Right Campus for Your Career",
        description: "Compare world-class institutions including Golden Gate University, Rushford Business School, SSBM Geneva, IIMs, and IIITs.",
        primaryCtaText: "Compare Universities",
        primaryCtaLink: "/universities/compare",

        bgImage: iimDesktopId,     // 🖥️ Desktop Media
        mobileImage: mainMobileId,  // 📱 Mobile Media
        order: 2,
      },
    ];

    for (const item of heroSeedData) {
      await Hero.findOneAndUpdate(
        { page: item.page, name: item.name },
        item,
        { upsert: true, new: true }
      );
      console.log(`✅ Hero section seeded with Desktop & Mobile Media ObjectIDs for page: "${item.page}"`);
    }

    console.log(`\n🎉 Done! Successfully seeded Desktop & Mobile Media ObjectIDs.`);
  } catch (error) {
    console.error("❌ Error seeding Hero sections:", error);
  }
}

if (require.main === module) {
  seedHero().then(() => mongoose.connection.close());
}

module.exports = { seedHero };
