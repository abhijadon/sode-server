"use strict";

/**
 * course.filter.js — Fastify Prehandler Middleware
 *
 * Resolves all query params into a ready-made Mongoose `partnerFilter` object
 * and attaches it to `request.courseFilter` so the controller just runs the DB query.
 *
 * Usage (in route):
 *   { preHandler: buildCourseFilter, handler: getWebsiteCourses }
 */

const mongoose = require("mongoose");
const { Category } = require("../../model/Category");
const { Subcourse } = require("../../model/Subcourse");
const { University } = require("../../model/University");
const { Course } = require("../../model/Course");
const { Duration } = require("../../model/Duration");
const { Fee } = require("../../model/Fee");

async function buildCourseFilter(request, reply) {
  const {
    search,
    category,
    subcategory,
    subcourse,
    university,
    course,
    duration,
    fee,
    featured,
    sort,
    limit,
    page,
  } = request.query || {};

  const partnerFilter = { removed: false, enabled: true };

  // ─── 1️⃣ Category & Subcategory Hierarchical Filter ───────────────────────
  const categoryParam = category && category !== "all" ? category : null;
  const subcategoryParam =
    (subcategory || subcourse) &&
    subcategory !== "all" &&
    subcourse !== "all"
      ? subcategory || subcourse
      : null;

  if (categoryParam || subcategoryParam) {
    let parentCatIds = [];
    let subCatIds = [];

    // A. Resolve Parent Category IDs
    if (categoryParam) {
      const parts = String(categoryParam).split("-");
      const prefix = parts[0];

      const parentCats = await Category.find({
        removed: false,
        $or: [
          { slug: categoryParam },
          { slug: prefix },
          { name: new RegExp(`^${prefix}$`, "i") },
          { name: new RegExp(prefix.replace(/-/g, " "), "i") },
          ...(mongoose.Types.ObjectId.isValid(categoryParam)
            ? [{ _id: categoryParam }]
            : []),
        ],
      })
        .select("_id parentId")
        .lean();

      for (const cat of parentCats) {
        if (Array.isArray(cat.parentId) && cat.parentId.length > 0) {
          parentCatIds.push(...cat.parentId);
        } else if (cat.parentId && !Array.isArray(cat.parentId)) {
          parentCatIds.push(cat.parentId); // legacy single ObjectId
        } else {
          parentCatIds.push(cat._id); // root category → use itself
        }
      }

      // Compound slug handling (e.g. "certification-ai-courses")
      if (!subcategoryParam && parts.length > 1) {
        const stripped = categoryParam.replace(
          /^(diploma|certification|master|doctorate|browse)-/,
          ""
        );
        const subDocs = await Category.find({
          removed: false,
          $or: [
            { slug: categoryParam },
            { slug: stripped },
            { slug: `browse-${stripped}` },
            { slug: `${prefix}-${stripped}` },
            { name: new RegExp(`^${stripped.replace(/-/g, " ")}$`, "i") },
          ],
        })
          .select("_id")
          .lean();
        subCatIds.push(...subDocs.map((s) => s._id));
      }
    }

    // B. Resolve Subcategory IDs
    if (subcategoryParam) {
      const terms = String(subcategoryParam)
        .split(",")
        .map((t) => t.trim());
      const mainPrefix = categoryParam
        ? String(categoryParam).split("-")[0]
        : "";

      for (const term of terms) {
        const stripped = term.replace(
          /^(diploma|certification|master|doctorate|browse)-/,
          ""
        );
        const termRegex = new RegExp(
          `^${term
            .replace(/-/g, " ")
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        );
        const strippedRegex = new RegExp(
          `^${stripped
            .replace(/-/g, " ")
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        );

        const subDocs = await Category.find({
          removed: false,
          $or: [
            { slug: term },
            { slug: stripped },
            { slug: `browse-${stripped}` },
            ...(mainPrefix ? [{ slug: `${mainPrefix}-${stripped}` }] : []),
            { name: termRegex },
            { name: strippedRegex },
            ...(mongoose.Types.ObjectId.isValid(term) ? [{ _id: term }] : []),
          ],
        })
          .select("_id")
          .lean();

        subCatIds.push(...subDocs.map((s) => s._id));
      }
    }

    // C. Apply filter criteria
    if (categoryParam && parentCatIds.length === 0) {
      partnerFilter._id = null; // unknown category → 0 results
    } else if (subcategoryParam && subCatIds.length === 0) {
      partnerFilter._id = null; // unknown subcategory → 0 results
    } else if (parentCatIds.length > 0 && subCatIds.length > 0) {
      partnerFilter.$and = [
        {
          $or: [
            { category: { $in: parentCatIds } },
            { categories: { $in: parentCatIds } },
          ],
        },
        { categories: { $in: subCatIds } },
      ];
    } else if (parentCatIds.length > 0) {
      const childCats = await Category.find({
        removed: false,
        parentId: { $in: parentCatIds },
      })
        .select("_id")
        .lean();

      const allCatIds = [...parentCatIds, ...childCats.map((c) => c._id)];

      partnerFilter.$or = [
        { category: { $in: parentCatIds } },
        { categories: { $in: allCatIds } },
      ];
    } else if (subCatIds.length > 0) {
      partnerFilter.categories = { $in: subCatIds };
    }
  }

  // ─── 2️⃣ Subcourse Filter ─────────────────────────────────────────────────
  if (subcourse && subcourse !== "all") {
    const subSlugs = String(subcourse)
      .split(",")
      .map((s) => s.trim());
    const subDocs = await Subcourse.find({
      removed: false,
      $or: [
        { slug: { $in: subSlugs } },
        {
          title: {
            $in: subSlugs.map((s) => new RegExp(s.replace(/-/g, " "), "i")),
          },
        },
        {
          name: {
            $in: subSlugs.map((s) => new RegExp(s.replace(/-/g, " "), "i")),
          },
        },
        ...subSlugs
          .filter((s) => mongoose.Types.ObjectId.isValid(s))
          .map((s) => ({ _id: s })),
      ],
    })
      .select("_id")
      .lean();

    if (subDocs && subDocs.length > 0) {
      partnerFilter.subcourse = { $in: subDocs.map((sd) => sd._id) };
    }
  }

  // ─── 3️⃣ University Filter ────────────────────────────────────────────────
  if (university && university !== "all") {
    const uSlugs = String(university)
      .split(",")
      .map((u) => u.trim());
    const uniDocs = await University.find({
      removed: false,
      $or: [
        { slug: { $in: uSlugs } },
        {
          name: {
            $in: uSlugs.map((s) => new RegExp(s.replace(/-/g, " "), "i")),
          },
        },
        ...uSlugs
          .filter((s) => mongoose.Types.ObjectId.isValid(s))
          .map((s) => ({ _id: s })),
      ],
    })
      .select("_id")
      .lean();

    if (uniDocs && uniDocs.length > 0) {
      partnerFilter.university = { $in: uniDocs.map((u) => u._id) };
    }
  }

  // ─── 4️⃣ Course Filter ────────────────────────────────────────────────────
  if (course && course !== "all") {
    const cTitles = String(course)
      .split(",")
      .map((c) => c.trim());
    const courseDocs = await Course.find({
      removed: false,
      $or: [
        { slug: { $in: cTitles } },
        {
          title: {
            $in: cTitles.map((t) => new RegExp(t.replace(/-/g, " "), "i")),
          },
        },
        ...cTitles
          .filter((c) => mongoose.Types.ObjectId.isValid(c))
          .map((c) => ({ _id: c })),
      ],
    })
      .select("_id")
      .lean();

    if (courseDocs && courseDocs.length > 0) {
      partnerFilter.course = { $in: courseDocs.map((cd) => cd._id) };
    }
  }

  // ─── 5️⃣ Duration Filter ──────────────────────────────────────────────────
  if (duration && duration !== "all") {
    const durationDocs = await Duration.find({
      removed: false,
      $or: [
        { slug: duration },
        {
          title: new RegExp(
            duration.replace("-year", "").replace("-month", ""),
            "i"
          ),
        },
        ...(mongoose.Types.ObjectId.isValid(duration)
          ? [{ _id: duration }]
          : []),
      ],
    })
      .select("_id")
      .lean();

    if (durationDocs && durationDocs.length > 0) {
      partnerFilter.duration = { $in: durationDocs.map((d) => d._id) };
    }
  }

  // ─── 6️⃣ Fee Filter ───────────────────────────────────────────────────────
  if (fee && fee !== "all") {
    const feeDocs = await Fee.find({
      removed: false,
      $or: [
        { slug: fee },
        { title: new RegExp(fee.replace(/-/g, " "), "i") },
        ...(mongoose.Types.ObjectId.isValid(fee) ? [{ _id: fee }] : []),
      ],
    })
      .select("_id")
      .lean();

    if (feeDocs && feeDocs.length > 0) {
      partnerFilter.fee = { $in: feeDocs.map((f) => f._id) };
    }
  }

  // ─── 7️⃣ Featured Flag ────────────────────────────────────────────────────
  if (featured === "true" || featured === true) {
    partnerFilter.featured = true;
  }

  // ─── 8️⃣ Text Search ──────────────────────────────────────────────────────
  if (search && search.trim().length > 0) {
    const sRegex = new RegExp(search.trim(), "i");
    partnerFilter.$or = [
      { title: sRegex },
      { description: sRegex },
    ];
  }

  // ─── Sort Options ─────────────────────────────────────────────────────────
  let mSort = { order: 1, createdAt: -1 };
  if (sort === "featured") mSort = { featured: -1, order: 1, createdAt: -1 };
  else if (sort === "newest") mSort = { createdAt: -1 };
  else if (sort === "title-asc") mSort = { title: 1 };
  else if (sort === "title-desc") mSort = { title: -1 };

  // ─── Pagination ───────────────────────────────────────────────────────────
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(0, parseInt(limit, 10) || 0);
  const skipNum = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

  // Attach resolved values to request for the controller
  request.courseFilter = {
    partnerFilter,
    mSort,
    pageNum,
    limitNum,
    skipNum,
  };
}

module.exports = { buildCourseFilter };
