"use strict";

const mongoose = require("mongoose");
require("dotenv").config();

const { Media } = require("../model/Media");
const { Course } = require("../model/Course");
const { University } = require("../model/University");
const { SiteSetting } = require("../model/SiteSetting");

async function updateMediaUrlsInDatabase() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/sode";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log("🔄 Fetching all Media records from MongoDB...");
    const mediaDocs = await Media.find({ removed: false }).lean();

    if (!mediaDocs || mediaDocs.length === 0) {
      console.warn("⚠️ No Media records found in database.");
      process.exit(0);
    }

    // Build lookup maps by original fileName and name
    const urlMap = {};
    mediaDocs.forEach((doc) => {
      if (doc.name) urlMap[doc.name.toLowerCase()] = doc.url;
      if (doc.fileName) urlMap[doc.fileName.toLowerCase()] = doc.url;
    });

    console.log(`🗺️ Loaded ${Object.keys(urlMap).length} media URL mappings.`);

    // Helper to find MinIO URL for a local path or filename (with fuzzy extension matching)
    function getMinioUrl(pathStr) {
      if (!pathStr || pathStr.startsWith("http://") || pathStr.startsWith("https://")) {
        return pathStr;
      }
      const rawBase = pathStr.split("/").pop().toLowerCase();
      const nameWithoutExt = rawBase.includes(".")
        ? rawBase.substring(0, rawBase.lastIndexOf("."))
        : rawBase;

      // 1. Direct match
      if (urlMap[rawBase]) return urlMap[rawBase];

      // 2. Fuzzy match without extension
      for (const [key, url] of Object.entries(urlMap)) {
        const keyWithoutExt = key.includes(".")
          ? key.substring(0, key.lastIndexOf("."))
          : key;
        if (keyWithoutExt === nameWithoutExt) {
          return url;
        }
      }

      return pathStr;
    }

    // 1. Update Courses
    console.log("📚 Updating Courses with MinIO media URLs...");
    const courses = await Course.find({ removed: false });
    let updatedCoursesCount = 0;
    for (const course of courses) {
      let modified = false;
      if (course.image) {
        const newImg = getMinioUrl(course.image);
        if (newImg !== course.image) {
          course.image = newImg;
          modified = true;
        }
      }
      if (course.logo) {
        const newLogo = getMinioUrl(course.logo);
        if (newLogo !== course.logo) {
          course.logo = newLogo;
          modified = true;
        }
      }
      if (modified) {
        await course.save();
        updatedCoursesCount++;
      }
    }
    console.log(`✅ Updated ${updatedCoursesCount} Course documents with MinIO URLs.`);

    // 2. Update Universities
    console.log("🏛️ Updating Universities with MinIO media URLs...");
    const universities = await University.find({ removed: false });
    let updatedUnivCount = 0;
    for (const univ of universities) {
      let modified = false;
      if (univ.logoSrc) {
        const newLogo = getMinioUrl(univ.logoSrc);
        if (newLogo !== univ.logoSrc) {
          univ.logoSrc = newLogo;
          modified = true;
        }
      }
      if (univ.imageSrc) {
        const newImg = getMinioUrl(univ.imageSrc);
        if (newImg !== univ.imageSrc) {
          univ.imageSrc = newImg;
          modified = true;
        }
      }
      if (modified) {
        await univ.save();
        updatedUnivCount++;
      }
    }
    console.log(`✅ Updated ${updatedUnivCount} University documents with MinIO URLs.`);

    // 3. Update SiteSettings
    console.log("⚙️ Updating SiteSettings with MinIO media URLs...");
    const settings = await SiteSetting.find({ removed: false });
    let updatedSettingsCount = 0;
    for (const setting of settings) {
      let modified = false;
      if (setting.faviconIco) {
        const newIco = getMinioUrl(setting.faviconIco);
        if (newIco !== setting.faviconIco) {
          setting.faviconIco = newIco;
          modified = true;
        }
      }
      if (setting.faviconSvg) {
        const newSvg = getMinioUrl(setting.faviconSvg);
        if (newSvg !== setting.faviconSvg) {
          setting.faviconSvg = newSvg;
          modified = true;
        }
      }
      if (setting.favicon96) {
        const new96 = getMinioUrl(setting.favicon96);
        if (new96 !== setting.favicon96) {
          setting.favicon96 = new96;
          modified = true;
        }
      }
      if (setting.appleTouchIcon) {
        const newApple = getMinioUrl(setting.appleTouchIcon);
        if (newApple !== setting.appleTouchIcon) {
          setting.appleTouchIcon = newApple;
          modified = true;
        }
      }
      if (setting.ogImage) {
        const newOg = getMinioUrl(setting.ogImage);
        if (newOg !== setting.ogImage) {
          setting.ogImage = newOg;
          modified = true;
        }
      }
      if (modified) {
        await setting.save();
        updatedSettingsCount++;
      }
    }
    console.log(`✅ Updated ${updatedSettingsCount} SiteSetting documents with MinIO URLs.`);

    console.log("🎉 All DB media links replaced with MinIO public URLs!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Media URL DB Replacement Error:", error);
    process.exit(1);
  }
}

updateMediaUrlsInDatabase();
