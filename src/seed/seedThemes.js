"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Theme } = require("../model/Theme");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

const defaultTheme = {
  themeName: "Default SODE Blue & Gold",
  themeMode: "dark",
  
  primaryColor: "#102441",
  secondaryColor: "#EEC471",
  accentColor: "#3b82f6",
  backgroundColor: "#0a1424",
  textColor: "#f8fafc",

  useGradient: true,
  gradientStart: "#102441",
  gradientEnd: "#0a1424",
  gradientDirection: "to-b",

  buttonBgColor: "#EEC471",
  buttonTextColor: "#102441",
  buttonHoverBgColor: "#f7d594",
  buttonBorderRadius: "full",

  cardBgColor: "#162a4d",
  cardBorderColor: "#1e3b6c",
  cardShadow: "lg",

  headerBgColor: "#102441",
  headerTextColor: "#ffffff",
  headerSticky: true,
  headerFont: "Inter",
  logoWidth: 120,
  logoHeight: 40,

  maxContainerWidth: "1440px",
  headingFont: "Outfit",
  bodyFont: "Inter",
  borderRadius: "lg",

  glassmorphism: true,
  transitionSpeed: "normal",
  enableAnimations: true,

  isDefault: true,
  enabled: true,
  customCss: `/* Custom style rules override */
body {
  scroll-behavior: smooth;
}`,
};

async function seedDefaultTheme() {
  try {
    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("🔄 Upserting Premium Default Appearance Theme...");
    await Theme.findOneAndUpdate(
      { themeName: defaultTheme.themeName },
      { $set: defaultTheme },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    console.log(`✅ Synced premium default theme: ${defaultTheme.themeName}`);

    console.log("🎉 Done! Premium default theme successfully synced!");
  } catch (error) {
    console.error("❌ Error seeding theme:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedDefaultTheme();
