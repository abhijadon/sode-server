"use strict";

require("module-alias/register");
require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
require("../model/Header");
require("../model/Media");

async function findOrCreateMedia(url, defaultName = "Media Asset") {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  const Media = mongoose.model("Media");
  let media = await Media.findOne({ url: cleanUrl });
  if (!media) {
    const parts = cleanUrl.split("/");
    const fileName = parts[parts.length - 1] || "logo.jpg";
    const mimeType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";

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
    console.log(`✅ Created Media document for header: ${media.name} (${media._id})`);
  }
  return media._id;
}

async function seedHeaders() {
  try {
    const Header = mongoose.model("Header");

    // Optional: force re-seed if --force flag is passed
    const isForce = process.argv.includes("--force");
    if (isForce) {
      await Header.deleteMany({});
      console.log("🧹 Cleared existing headers due to --force flag.");
    } else {
      const count = await Header.countDocuments({ removed: false });
      if (count > 0) {
        console.log("ℹ️ Headers already exist in MongoDB, skipping auto-seed.");
        return;
      }
    }

    console.log("🚀 Seeding initial Dynamic Headers with pure Media ObjectId refs in MongoDB...");

    // Create Media documents for site logo & header icons
    const siteLogoMediaId = await findOrCreateMedia("/assets/images/new_sode_tm_logo.png", "Site Main Logo");
    const mbaMediaId = await findOrCreateMedia("/assets/images/premium-icon.png", "MBA Logo");
    const dbaMediaId = await findOrCreateMedia("/assets/images/premium-icon.png", "DBA Logo");
    const mcaMediaId = await findOrCreateMedia("/assets/images/premium-icon.png", "MCA Logo");

    const gguMediaId = await findOrCreateMedia("/assets/images/ggu-logo.jpg", "Golden Gate University Logo");
    const ssbmMediaId = await findOrCreateMedia("/assets/images/ssbm-logo.jpg", "SSBM Geneva Logo");
    const esgciMediaId = await findOrCreateMedia("/assets/images/esgci-logo.jpg", "ESGCI Paris Logo");

    // 0. Root Special Document: Site Header Logo (Pure ObjectId for logoSrc & mediaId)
    await Header.create({
      label: "SODE Header Logo",
      href: "/",
      slug: "site-header-logo",
      mediaId: siteLogoMediaId,
      logoSrc: siteLogoMediaId,
      order: 0,
      enabled: true,
    });

    // 1. Root Header: Executive Programs
    const execHeader = await Header.create({
      label: "Executive Programs",
      href: "/courses",
      slug: "executive-programs",
      premium: true,
      order: 1,
      enabled: true,
      badge: "HOT",
      badgeColor: "gold",
    });

    // Children for Executive Programs with mediaId & logoSrc as Media ObjectId refs
    await Header.create([
      {
        parentId: execHeader._id,
        label: "Master of Business Administration (MBA)",
        href: "/courses/distance-mba",
        slug: "distance-mba",
        showLogo: true,
        mediaId: mbaMediaId,
        logoSrc: mbaMediaId,
        order: 1,
        enabled: true,
      },
      {
        parentId: execHeader._id,
        label: "Doctor of Business Administration (DBA)",
        href: "/courses/online-dba",
        slug: "online-dba",
        showLogo: true,
        mediaId: dbaMediaId,
        logoSrc: dbaMediaId,
        order: 2,
        enabled: true,
        badge: "DOCTORATE",
      },
      {
        parentId: execHeader._id,
        label: "Master of Computer Applications (MCA)",
        href: "/courses/online-mca",
        slug: "online-mca",
        showLogo: true,
        mediaId: mcaMediaId,
        logoSrc: mcaMediaId,
        order: 3,
        enabled: true,
      },
    ]);

    // 2. Root Header: Universities
    const uniHeader = await Header.create({
      label: "Universities",
      href: "/universities",
      slug: "universities",
      order: 2,
      enabled: true,
    });

    // Children for Universities with mediaId & logoSrc as Media ObjectId refs
    await Header.create([
      {
        parentId: uniHeader._id,
        label: "Golden Gate University",
        href: "/universities/golden-gate-university",
        slug: "golden-gate-university",
        showLogo: true,
        mediaId: gguMediaId,
        logoSrc: gguMediaId,
        order: 1,
        enabled: true,
      },
      {
        parentId: uniHeader._id,
        label: "SSBM Geneva",
        href: "/universities/ssbm-geneva",
        slug: "ssbm-geneva",
        showLogo: true,
        mediaId: ssbmMediaId,
        logoSrc: ssbmMediaId,
        order: 2,
        enabled: true,
      },
      {
        parentId: uniHeader._id,
        label: "ESGCI Paris",
        href: "/universities/esgci-paris",
        slug: "esgci-paris",
        showLogo: true,
        mediaId: esgciMediaId,
        logoSrc: esgciMediaId,
        order: 3,
        enabled: true,
      },
    ]);

    // 3. Root Header: About SODE
    await Header.create({
      label: "About SODE",
      href: "/#about",
      slug: "about-sode",
      order: 3,
      enabled: true,
    });

    // 4. Root Header: Alumni Voices
    await Header.create({
      label: "Alumni Voices",
      href: "/#reviews",
      slug: "alumni-voices",
      order: 4,
      enabled: true,
    });

    // 5. Root Header: FAQs
    await Header.create({
      label: "FAQs",
      href: "/#faqs",
      slug: "faqs",
      order: 5,
      enabled: true,
    });

    console.log("✅ Dynamic Headers with pure Media ObjectId references successfully seeded into MongoDB!");
  } catch (error) {
    console.error("❌ Error seeding headers:", error);
  }
}

if (require.main === module) {
  (async () => {
    await connectDB();
    await seedHeaders();
    await mongoose.connection.close();
    process.exit(0);
  })();
}

module.exports = { seedHeaders };
