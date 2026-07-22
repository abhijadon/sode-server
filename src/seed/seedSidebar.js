"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Sidebar } = require("../model/Sidebar");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

const completeSidebarItems = [
  // 📌 Site Content
  {
    title: "Hero Banners",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 0,
    icon: { name: "Image", library: "lucide" },
    path: "/admin-dashboard/hero",
    enabled: true,
  },
  {
    title: "Categories",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 1,
    icon: { name: "Tags", library: "lucide" },
    path: "/admin-dashboard/categories",
    enabled: true,
  },
  {
    title: "Durations",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 2,
    icon: { name: "Clock", library: "lucide" },
    path: "/admin-dashboard/durations",
    enabled: true,
  },
  {
    title: "Eligibility",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 3,
    icon: { name: "CheckCircle", library: "lucide" },
    path: "/admin-dashboard/eligibility",
    enabled: true,
  },
  {
    title: "Fees",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 4,
    icon: { name: "DollarSign", library: "lucide" },
    path: "/admin-dashboard/fee",
    enabled: true,
  },
  {
    title: "Courses",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 4,
    icon: { name: "GraduationCap", library: "lucide" },
    path: "/admin-dashboard/courses",
    enabled: true,
  },
  {
    title: "Partner Courses",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 5,
    icon: { name: "BookMarked", library: "lucide" },
    path: "/admin-dashboard/partner-courses",
    enabled: true,
  },
  {
    title: "Subcourses",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 6,
    icon: { name: "BookOpen", library: "lucide" },
    path: "/admin-dashboard/subcourses",
    enabled: true,
  },
  {
    title: "Universities",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 6,
    icon: { name: "Building2", library: "lucide" },
    path: "/admin-dashboard/universities",
    enabled: true,
  },
  {
    title: "Partner Universities",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 7,
    icon: { name: "Building", library: "lucide" },
    path: "/admin-dashboard/partner-universities",
    enabled: true,
  },
  {
    title: "Header Links",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 8,
    icon: { name: "Menu", library: "lucide" },
    path: "/admin-dashboard/headers",
    enabled: true,
  },
  {
    title: "FAQs",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 9,
    icon: { name: "HelpCircle", library: "lucide" },
    path: "/admin-dashboard/faqs",
    enabled: true,
  },
  {
    title: "Media Library",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 10,
    icon: { name: "Image", library: "lucide" },
    path: "/admin-dashboard/media",
    enabled: true,
  },
  {
    title: "Countries",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 11,
    icon: { name: "Globe", library: "lucide" },
    path: "/admin-dashboard/countries",
    enabled: true,
  },
  {
    title: "States",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 12,
    icon: { name: "Map", library: "lucide" },
    path: "/admin-dashboard/states",
    enabled: true,
  },
  {
    title: "Cities",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 13,
    icon: { name: "MapPin", library: "lucide" },
    path: "/admin-dashboard/cities",
    enabled: true,
  },
  {
    title: "Locations",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 14,
    icon: { name: "Navigation", library: "lucide" },
    path: "/admin-dashboard/locations",
    enabled: true,
  },
  {
    title: "Contents",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 15,
    icon: { name: "FileText", library: "lucide" },
    path: "/admin-dashboard/contents",
    enabled: true,
  },
  {
    title: "Pages Builder",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 16,
    icon: { name: "Layers", library: "lucide" },
    path: "/admin-dashboard/pages",
    enabled: true,
  },
  {
    title: "Pincodes",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 17,
    icon: { name: "Hash", library: "lucide" },
    path: "/admin-dashboard/pincodes",
    enabled: true,
  },
  {
    title: "Ratings",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 18,
    icon: { name: "Star", library: "lucide" },
    path: "/admin-dashboard/ratings",
    enabled: true,
  },

  // 📌 User Control
  {
    title: "Users",
    section: "User Control",
    sectionOrder: 4,
    itemOrder: 1,
    icon: { name: "Users", library: "lucide" },
    path: "/admin-dashboard/users",
    enabled: true,
  },
  {
    title: "Roles",
    section: "User Control",
    sectionOrder: 4,
    itemOrder: 2,
    icon: { name: "Shield", library: "lucide" },
    path: "/admin-dashboard/roles",
    enabled: true,
  },
  {
    title: "Workspaces",
    section: "User Control",
    sectionOrder: 4,
    itemOrder: 3,
    icon: { name: "Briefcase", library: "lucide" },
    path: "/admin-dashboard/workspace",
    enabled: true,
  },
  {
    title: "Tenants",
    section: "User Control",
    sectionOrder: 4,
    itemOrder: 4,
    icon: { name: "Building", library: "lucide" },
    path: "/admin-dashboard/tenants",
    enabled: true,
  },

  // 📌 Settings
  {
    title: "Sidebar Items",
    section: "Settings",
    sectionOrder: 5,
    itemOrder: 1,
    icon: { name: "LayoutList", library: "lucide" },
    path: "/admin-dashboard/sidebar",
    enabled: true,
  },
  {
    title: "Page Meta",
    section: "Settings",
    sectionOrder: 5,
    itemOrder: 2,
    icon: { name: "Search", library: "lucide" },
    path: "/admin-dashboard/pagemeta",
    enabled: true,
  },
  {
    title: "Site Settings",
    section: "Settings",
    sectionOrder: 5,
    itemOrder: 3,
    icon: { name: "Settings", library: "lucide" },
    path: "/admin-dashboard/sitesetting",
    enabled: true,
  },
  {
    title: "Appearance Theme",
    section: "Settings",
    sectionOrder: 5,
    itemOrder: 4,
    icon: { name: "Palette", library: "lucide" },
    path: "/admin-dashboard/appearance",
    enabled: true,
  },
];

async function seedAllSidebarItems() {
  try {
    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("🔄 Upserting all complete Sidebar items...");

    let addedCount = 0;
    for (const item of completeSidebarItems) {
      await Sidebar.findOneAndUpdate(
        { path: item.path },
        { $set: item },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
      console.log(`✅ Synced sidebar item: ${item.title} (${item.path})`);
      addedCount++;
    }

    console.log(`🎉 Done! All ${addedCount} sidebar items successfully synced!`);
  } catch (error) {
    console.error("❌ Error seeding sidebar items:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedAllSidebarItems();
