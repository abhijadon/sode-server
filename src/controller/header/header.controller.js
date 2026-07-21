"use strict";

const mongoose = require("mongoose");

const getWebsiteHeaders = async (request, reply) => {
  try {
    const queryConditions = {
      removed: false,
      enabled: true,
    };

    if (request.queryConditions && typeof request.queryConditions === "object") {
      Object.assign(queryConditions, request.queryConditions);
    }

    const Header = mongoose.model("Header");
    const flatHeaders = await Header.find(queryConditions)
      .select(
        "label href slug icon order parentId showOnDesktop showOnMobile premium text color bgColor textColor openInNewTab mediaId logoSrc showLogo relatedCourse relatedUniversity badge badgeColor",
      )
      .populate("mediaId", "url name alt")
      .populate("logoSrc", "url name alt")
      .populate("relatedCourse", "title slug logoSrc image")
      .populate("relatedUniversity", "name slug logoSrc")
      .sort({ order: 1 })
      .lean();

    // ==========================================
    // 🔥 BUILD NESTED TREE & RESOLVE LOGOS FROM MEDIA OBJECTID
    // ==========================================
    const itemMap = Object.create(null);
    const treeRoots = [];

    // Find main site logo if configured as a header item with slug "site-header-logo"
    const logoItem = flatHeaders.find((item) => item.slug === "site-header-logo");
    const siteLogo =
      logoItem?.mediaId?.url ||
      logoItem?.logoSrc?.url ||
      (typeof logoItem?.logoSrc === "string" ? logoItem?.logoSrc : null) ||
      null;

    // Filter out site logo from navigation items list
    const navItems = flatHeaders.filter((item) => item.slug !== "site-header-logo");

    navItems.forEach((item) => {
      // Auto-resolve logo URL from Media ObjectId populate or course/university logo
      const resolvedLogo =
        item.mediaId?.url ||
        item.logoSrc?.url ||
        (typeof item.logoSrc === "string" ? item.logoSrc : null) ||
        (typeof item.relatedCourse?.logoSrc === "object" ? item.relatedCourse?.logoSrc?.url : item.relatedCourse?.logoSrc) ||
        item.relatedCourse?.image ||
        (typeof item.relatedUniversity?.logoSrc === "object" ? item.relatedUniversity?.logoSrc?.url : item.relatedUniversity?.logoSrc) ||
        null;

      itemMap[item._id.toString()] = {
        ...item,
        logoSrc: resolvedLogo,
        showLogo: item.showLogo !== false,
        children: [],
      };
    });

    navItems.forEach((item) => {
      const mappedItem = itemMap[item._id.toString()];

      if (item.parentId) {
        const parentIdStr = item.parentId._id
          ? item.parentId._id.toString()
          : item.parentId.toString();

        if (itemMap[parentIdStr]) {
          itemMap[parentIdStr].children.push(mappedItem);
        }
      } else {
        treeRoots.push(mappedItem);
      }
    });

    const sortTree = (nodes) => {
      nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortTree(node.children);
        }
      });
    };

    sortTree(treeRoots);

    return reply.code(200).send({
      success: true,
      result: treeRoots,
      siteLogo: siteLogo,
      message: "Website headers tree retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error in getWebsiteHeaders:", error);

    return reply.code(500).send({
      success: false,
      result: null,
      siteLogo: null,
      message: "An error occurred while retrieving website headers tree",
      error: error.message,
    });
  }
};

module.exports = { getWebsiteHeaders };
