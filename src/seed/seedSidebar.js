"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Sidebar } = require("../model/Sidebar");

// Only new / missing sidebar items to add
const missingSidebarItems = [
  {
    title: "Courses",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 2,
    icon: { name: "GraduationCap", library: "lucide" },
    path: "/admin-dashboard/courses",
    enabled: true,
  },
  {
    title: "Universities",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 3,
    icon: { name: "Building2", library: "lucide" },
    path: "/admin-dashboard/universities",
    enabled: true,
  },
  {
    title: "FAQs",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 4,
    icon: { name: "HelpCircle", library: "lucide" },
    path: "/admin-dashboard/faqs",
    enabled: true,
  },
  {
    title: "Media Library",
    section: "Site Content",
    sectionOrder: 2,
    itemOrder: 5,
    icon: { name: "Image", library: "lucide" },
    path: "/admin-dashboard/media",
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
];

async function seedMissingSidebarItems() {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb://crmadmin:Abhishek2028@172.105.37.57:27017/sode?authSource=admin";

    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);

    console.log("🔄 Checking and inserting missing Sidebar items...");

    let addedCount = 0;
    for (const item of missingSidebarItems) {
      const exists = await Sidebar.exists({ path: item.path });
      if (!exists) {
        await Sidebar.create(item);
        console.log(`✅ Created missing sidebar item: ${item.title} (${item.path})`);
        addedCount++;
      } else {
        console.log(`ℹ️ Item already exists, skipping: ${item.title}`);
      }
    }

    console.log(`🎉 Done! ${addedCount} missing sidebar items created.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding sidebar items:", error);
    process.exit(1);
  }
}

seedMissingSidebarItems();
