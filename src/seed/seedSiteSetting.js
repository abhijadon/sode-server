"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { SiteSetting } = require("../model/SiteSetting");

const defaultSiteSetting = {
  settingKey: "default_site_setting",
  siteName: "SODE",
  siteUrl: "https://sode.co.in",
  gtmId: "GTM-567GP8S9",
  googleAdsIds: ["AW-17917271919", "AW-17946162864"],
  faviconIco: "/assets/images/favicon.ico",
  faviconSvg: "/assets/images/favicon.svg",
  favicon96: "/assets/images/favicon-96x96.png",
  appleTouchIcon: "/assets/images/apple-touch-icon.png",
  webmanifest: "/assets/images/site.webmanifest",
  ogImage: "https://sode.co.in/assets/images/sode-homepage-og-card-image.png",
  showGlobalCta: true,
  enabled: true,
};

async function seedSiteSetting() {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb://crmadmin:Abhishek2028@172.105.37.57:27017/sode?authSource=admin";

    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);

    console.log("🔄 Upserting site setting data...");

    await SiteSetting.findOneAndUpdate(
      { settingKey: defaultSiteSetting.settingKey },
      { $set: defaultSiteSetting },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    console.log("🎉 SiteSetting successfully imported into MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding SiteSetting:", error);
    process.exit(1);
  }
}

seedSiteSetting();
