"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Workspace } = require("../model/Workspace");
const { University } = require("../model/University");
const { Tenant } = require("../model/Tenant");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode";

async function seedUpGradWorkspaceAndUpdateUniversities() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 Connected to MongoDB.");

    // 1. Find or create default Tenant if needed
    let defaultTenant = await Tenant.findOne({ removed: false });
    if (!defaultTenant) {
      defaultTenant = await Tenant.create({
        name: "Default Tenant",
        slug: "default-tenant",
        enabled: true,
      });
      console.log(`✅ Created default Tenant "${defaultTenant.name}" (${defaultTenant._id})`);
    }

    // 2. Find or create upGrad Workspace
    let upgradWorkspace = await Workspace.findOne({
      name: { $regex: /^upgrad$/i },
      removed: false,
    });

    if (!upgradWorkspace) {
      upgradWorkspace = await Workspace.create({
        name: "upGrad",
        description: "upGrad Partner Workspace",
        tenantId: [defaultTenant._id],
        enabled: true,
      });
      console.log(`✨ Created Workspace "upGrad" (${upgradWorkspace._id})`);
    } else {
      console.log(`🔍 Found existing Workspace "upGrad" (${upgradWorkspace._id})`);
    }

    // 3. Update all Universities to set/add upGrad Workspace _id in workspaceId array
    const updateRes = await University.updateMany(
      { removed: false },
      { $addToSet: { workspaceId: upgradWorkspace._id } }
    );

    console.log(`\n🎉 Successfully updated ${updateRes.modifiedCount || updateRes.matchedCount} Universities with workspaceId: "${upgradWorkspace._id}" (upGrad Workspace)`);

    const uniCount = await University.countDocuments({ workspaceId: upgradWorkspace._id });
    console.log(`📊 Total Universities linked to upGrad Workspace: ${uniCount}`);

  } catch (err) {
    console.error("❌ Error in seedUpGradWorkspaceAndUpdateUniversities:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

seedUpGradWorkspaceAndUpdateUniversities();
