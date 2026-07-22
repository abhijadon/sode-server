"use strict";

const mongoose = require("mongoose");
const { Category } = require("../../model/Category");
const { Media } = require("../../model/Media");

function fixMediaUrl(mediaObj) {
  if (!mediaObj) return null;
  if (typeof mediaObj === "string") {
    return mediaObj.replace(/^http:\/\/[^/]+:9000\//, "/media/");
  }
  if (typeof mediaObj === "object" && mediaObj !== null) {
    const rawUrl = mediaObj.url || mediaObj.path || "";
    const cleanUrl = rawUrl.replace(/^http:\/\/[^/]+:9000\//, "/media/");
    return {
      ...mediaObj,
      url: cleanUrl,
    };
  }
  return null;
}

// 🎯 Fetch All Website Categories & Hierarchical Parent-Child Tree
async function getWebsiteCategories(request, reply) {
  try {
    const categories = await Category.find({
      removed: false,
      enabled: true,
    })
      .sort({ order: 1, createdAt: 1 })
      .populate({ path: "logo", select: "_id name url alt" })
      .populate({ path: "logoSrc", select: "_id name url alt" })
      .populate({ path: "image", select: "_id name url alt" })
      .populate({ path: "imageSrc", select: "_id name url alt" })
      .populate({ path: "parentId", select: "_id name slug title" })
      .lean();

    const formattedCategories = (categories || []).map((cat) => ({
      ...cat,
      _id: String(cat._id),
      parentId: cat.parentId ? (typeof cat.parentId === "object" ? String(cat.parentId._id) : String(cat.parentId)) : null,
      parentSlug: cat.parentId && typeof cat.parentId === "object" ? cat.parentId.slug : null,
      logo: fixMediaUrl(cat.logo),
      logoSrc: fixMediaUrl(cat.logoSrc),
      image: fixMediaUrl(cat.image),
      imageSrc: fixMediaUrl(cat.imageSrc),
    }));

    // Build Parent-Child Tree
    const parents = formattedCategories.filter((cat) => !cat.parentId);
    const tree = parents.map((parent) => {
      const children = formattedCategories.filter(
        (child) => child.parentId && String(child.parentId) === String(parent._id)
      );
      return {
        ...parent,
        children,
      };
    });

    return reply.code(200).send({
      success: true,
      result: {
        categories: formattedCategories,
        tree,
      },
    });
  } catch (error) {
    console.error("Error in getWebsiteCategories:", error);
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch website categories",
    });
  }
}

// 🎯 Read Single Category By Slug with its Subcategories
async function getWebsiteCategoryBySlug(request, reply) {
  try {
    const { slug } = request.query || {};
    if (!slug) {
      return reply.code(400).send({
        success: false,
        message: "Category slug query parameter is required",
      });
    }

    const category = await Category.findOne({
      slug,
      removed: false,
      enabled: true,
    })
      .populate({ path: "logo", select: "_id name url alt" })
      .populate({ path: "logoSrc", select: "_id name url alt" })
      .populate({ path: "image", select: "_id name url alt" })
      .populate({ path: "imageSrc", select: "_id name url alt" })
      .populate({ path: "parentId", select: "_id name slug title" })
      .lean();

    if (!category) {
      return reply.code(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // Find all subcategories where parentId === category._id
    const childrenDocs = await Category.find({
      parentId: category._id,
      removed: false,
      enabled: true,
    })
      .sort({ order: 1, createdAt: 1 })
      .populate({ path: "logo", select: "_id name url alt" })
      .populate({ path: "logoSrc", select: "_id name url alt" })
      .populate({ path: "image", select: "_id name url alt" })
      .populate({ path: "imageSrc", select: "_id name url alt" })
      .lean();

    const formattedCategory = {
      ...category,
      _id: String(category._id),
      parentId: category.parentId ? (typeof category.parentId === "object" ? String(category.parentId._id) : String(category.parentId)) : null,
      logo: fixMediaUrl(category.logo),
      logoSrc: fixMediaUrl(category.logoSrc),
      image: fixMediaUrl(category.image),
      imageSrc: fixMediaUrl(category.imageSrc),
    };

    const formattedChildren = (childrenDocs || []).map((child) => ({
      ...child,
      _id: String(child._id),
      parentId: String(category._id),
      logo: fixMediaUrl(child.logo),
      logoSrc: fixMediaUrl(child.logoSrc),
      image: fixMediaUrl(child.image),
      imageSrc: fixMediaUrl(child.imageSrc),
    }));

    return reply.code(200).send({
      success: true,
      result: {
        category: formattedCategory,
        children: formattedChildren,
      },
    });
  } catch (error) {
    console.error("Error in getWebsiteCategoryBySlug:", error);
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to read website category",
    });
  }
}

// 🎯 Fetch Category Tree (Parents with nested Children)
async function getWebsiteCategoryTree(request, reply) {
  return getWebsiteCategories(request, reply);
}

module.exports = {
  getWebsiteCategories,
  getWebsiteCategoryBySlug,
  getWebsiteCategoryTree,
};
