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

/**
 * Helper — Normalize parentId (now an array of ObjectIds) into array of strings.
 * Handles both old single-ObjectId (legacy docs) and new array format.
 */
function normalizeParentIds(parentId) {
  if (!parentId) return [];
  // Legacy: single ObjectId stored as object or string
  if (!Array.isArray(parentId)) {
    const id = typeof parentId === "object" ? String(parentId._id || parentId) : String(parentId);
    return id ? [id] : [];
  }
  // New array format
  return parentId
    .filter(Boolean)
    .map((p) => (typeof p === "object" ? String(p._id || p) : String(p)));
}

/**
 * Helper — Normalize populated parentId array into array of {_id, name, slug} objects.
 */
function normalizePopulatedParents(parentId) {
  if (!parentId) return [];
  if (!Array.isArray(parentId)) {
    if (typeof parentId === "object" && parentId !== null) {
      return [{ _id: String(parentId._id), name: parentId.name, slug: parentId.slug, title: parentId.title }];
    }
    return [];
  }
  return parentId
    .filter(Boolean)
    .map((p) =>
      typeof p === "object"
        ? { _id: String(p._id), name: p.name, slug: p.slug, title: p.title }
        : { _id: String(p) }
    );
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

    const formattedCategories = (categories || []).map((cat) => {
      const parentIds = normalizeParentIds(cat.parentId);
      const parents = normalizePopulatedParents(cat.parentId);
      return {
        ...cat,
        _id: String(cat._id),
        // Array of parent IDs (strings)
        parentId: parentIds,
        // Array of parent slugs (for convenience)
        parentSlugs: parents.map((p) => p.slug).filter(Boolean),
        // Populated parent objects
        parents,
        logo: fixMediaUrl(cat.logo),
        logoSrc: fixMediaUrl(cat.logoSrc),
        image: fixMediaUrl(cat.image),
        imageSrc: fixMediaUrl(cat.imageSrc),
      };
    });

    // Build Parent-Child Tree
    // A category is a "root parent" if parentId array is empty
    const roots = formattedCategories.filter((cat) => !cat.parentId || cat.parentId.length === 0);
    const tree = roots.map((parent) => {
      const children = formattedCategories.filter(
        (child) => child.parentId && child.parentId.includes(String(parent._id))
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

    // Find all subcategories where parentId array contains category._id
    const childrenDocs = await Category.find({
      parentId: category._id,   // Mongoose $in semantics work for arrays automatically
      removed: false,
      enabled: true,
    })
      .sort({ order: 1, createdAt: 1 })
      .populate({ path: "logo", select: "_id name url alt" })
      .populate({ path: "logoSrc", select: "_id name url alt" })
      .populate({ path: "image", select: "_id name url alt" })
      .populate({ path: "imageSrc", select: "_id name url alt" })
      .lean();

    const parentIds = normalizeParentIds(category.parentId);
    const parents = normalizePopulatedParents(category.parentId);

    const formattedCategory = {
      ...category,
      _id: String(category._id),
      parentId: parentIds,
      parentSlugs: parents.map((p) => p.slug).filter(Boolean),
      parents,
      logo: fixMediaUrl(category.logo),
      logoSrc: fixMediaUrl(category.logoSrc),
      image: fixMediaUrl(category.image),
      imageSrc: fixMediaUrl(category.imageSrc),
    };

    const formattedChildren = (childrenDocs || []).map((child) => ({
      ...child,
      _id: String(child._id),
      parentId: [String(category._id)],
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

// 🎯 Fetch Lightweight Public Category Filter Options
async function getWebsiteCategoryOptions(request, reply) {
  try {
    const categories = await Category.find({
      removed: false,
      enabled: true,
    })
      .sort({ order: 1, name: 1 })
      .select("_id name title slug logo logoSrc type parentId")
      .populate({ path: "logo", select: "_id name url alt" })
      .populate({ path: "logoSrc", select: "_id name url alt" })
      .populate({ path: "parentId", select: "_id name slug" })
      .lean();

    const formattedCategories = (categories || []).map((cat) => {
      const parentIds = normalizeParentIds(cat.parentId);
      return {
        _id: String(cat._id),
        value: String(cat._id),
        label: cat.title || cat.name,
        name: cat.name,
        title: cat.title,
        slug: cat.slug,
        type: cat.type,
        // Array of parent IDs
        parentId: parentIds,
        isChild: parentIds.length > 0,
        logo: fixMediaUrl(cat.logo || cat.logoSrc),
      };
    });

    return reply.code(200).send({
      success: true,
      result: formattedCategories,
      items: formattedCategories,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error("Error in getWebsiteCategoryOptions:", error);
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch website category options",
    });
  }
}

module.exports = {
  getWebsiteCategories,
  getWebsiteCategoryBySlug,
  getWebsiteCategoryTree,
  getWebsiteCategoryOptions
};