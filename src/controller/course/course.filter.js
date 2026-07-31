"use strict";

/**
 * course.filter.js — Comprehensive Prehandler Filter Middleware
 *
 * Strictly separates Main Degree Categories (category) and Subcategories /
 * Specializations (subcategory & subcourse).
 */

const mongoose = require("mongoose");
const { Category } = require("../../model/Category");
const { University } = require("../../model/University");
const { Subcourse } = require("../../model/Subcourse");
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
  const andConditions = [];

  // Helper to split multi-value params by comma or pipe
  const splitValues = (param) => {
    if (!param || param === "all") return [];
    return String(param)
      .split(/[,|]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  };

  // List of recognized Main Degree Category slugs & prefixes
  const MAIN_DEGREE_SLUGS = new Set([
    "doctorate",
    "master",
    "bachelor",
    "certification",
    "diploma",
    "dual",
    "executive",
    "phd",
    "mba",
    "dba",
    "bba",
    "msc",
    "bsc",
    "ma",
    "ba",
    "pgd",
  ]);

  // ─── 1️⃣ Main Category Filter (e.g. category=doctorate) ────────────────────
  // Matches ONLY Main Degree Categories (e.g. Doctorate, Master, Bachelor, Certification, Diploma)
  async function resolveMainCategoryTokens(tokens) {
    if (!tokens || tokens.length === 0) return null;

    let catIds = [];

    for (const rawToken of tokens) {
      const stripped = rawToken.replace(/^(diploma|certification|master|doctorate|browse)-/, "");

      // Removed strict MAIN_DEGREE_SLUGS check to allow matching 'iit', 'iim', etc. as categories.

      // Find matching Main Categories for the specific token
      const mainCatDocs = await Category.find({
        removed: false,
        $or: [
          { slug: rawToken },
          { slug: stripped },
          { slug: `browse-${stripped}` },
          { name: new RegExp(`^${stripped.replace(/-/g, " ")}$`, "i") },
          ...(mongoose.Types.ObjectId.isValid(rawToken) ? [{ _id: rawToken }] : []),
        ],
      })
        .select("_id")
        .lean();

      const matchedIds = mainCatDocs.map((c) => c._id);
      catIds.push(...matchedIds);
    }

    // If no valid main degree category matched, force 0 results
    if (catIds.length === 0) return { _id: null };

    return {
      $or: [
        { categories: { $in: catIds } },
        { "universityOfferings.category": { $in: catIds } },
      ],
    };
  }

  // ─── 2️⃣ Subcategory & Specialization Filter (e.g. subcategory=ai-courses) ──
  // Matches Subcategories (topic categories) and Subcourses
  async function resolveSubcategoryTokens(tokens) {
    if (!tokens || tokens.length === 0) return null;

    let subCatIds = [];
    let subcourseIds = [];
    let uniMatchesFromSubcat = [];

    for (const rawToken of tokens) {
      const stripped = rawToken.replace(/^(diploma|certification|master|doctorate|browse)-/, "");

      // Find matching Subcategories
      const subCatDocs = await Category.find({
        removed: false,
        $or: [
          { slug: rawToken },
          { slug: stripped },
          { slug: `browse-${stripped}` },
          { name: new RegExp(`^${stripped.replace(/-/g, " ")}$`, "i") },
          ...(mongoose.Types.ObjectId.isValid(rawToken) ? [{ _id: rawToken }] : []),
        ],
      })
        .select("_id")
        .lean();

      subCatIds.push(...subCatDocs.map((c) => c._id));

      // Find matching Subcourses
      const subDocs = await Subcourse.find({
        removed: false,
        $or: [
          { slug: rawToken },
          { slug: stripped },
          { title: new RegExp(stripped.replace(/-/g, " "), "i") },
          ...(mongoose.Types.ObjectId.isValid(rawToken) ? [{ _id: rawToken }] : []),
        ],
      })
        .select("_id")
        .lean();

      subcourseIds.push(...subDocs.map((s) => s._id));

      // Also search University in case frontend passes a university slug (e.g. roorkee) as a subcategory
      const uniDocs = await University.find({
        removed: false,
        $or: [
          { slug: rawToken },
          { slug: stripped },
          { slug: new RegExp(stripped.replace(/-/g, " "), "i") },
          { name: new RegExp(`^${stripped.replace(/-/g, " ")}$`, "i") },
          { name: new RegExp(stripped.replace(/-/g, " "), "i") }, // loose match for 'roorkee' in 'IIT Roorkee'
          ...(mongoose.Types.ObjectId.isValid(rawToken) ? [{ _id: rawToken }] : []),
        ],
      })
        .select("_id")
        .lean();

      if (uniDocs.length > 0) {
        // We will store university IDs separately and add them to conditions
        uniMatchesFromSubcat.push(...uniDocs.map((u) => u._id));
      }
    }

    const subConditions = [];
    if (subCatIds.length > 0) {
      subConditions.push({ categories: { $in: subCatIds } });
      subConditions.push({ "universityOfferings.category": { $in: subCatIds } });
    }
    if (subcourseIds.length > 0) {
      subConditions.push({ "universityOfferings.subcourses.subcourse": { $in: subcourseIds } });
    }
    if (uniMatchesFromSubcat.length > 0) {
      subConditions.push({ "universityOfferings.university": { $in: uniMatchesFromSubcat } });
    }
    for (const token of tokens) {
      const sRegex = new RegExp(token.replace(/-/g, " "), "i");
      subConditions.push({ "universityOfferings.subcourses.title": sRegex });
    }

    return subConditions.length > 0 ? { $or: subConditions } : { _id: null };
  }

  // ─── Execute Category Filters ─────────────────────────────────────────────
  const catTokens = splitValues(category);
  if (catTokens.length > 0) {
    const mainCond = await resolveMainCategoryTokens(catTokens);
    if (mainCond) andConditions.push(mainCond);
  }

  const subcatTokens = splitValues(subcategory);
  if (subcatTokens.length > 0) {
    const subcatCond = await resolveSubcategoryTokens(subcatTokens);
    if (subcatCond) andConditions.push(subcatCond);
  }

  const subcourseTokens = splitValues(subcourse);
  if (subcourseTokens.length > 0) {
    const subcourseCond = await resolveSubcategoryTokens(subcourseTokens);
    if (subcourseCond) andConditions.push(subcourseCond);
  }

  // ─── 3️⃣ University Filter ──────────────────────────────────────────────────
  const uniTokens = splitValues(university);
  if (uniTokens.length > 0) {
    const uniDocs = await University.find({
      removed: false,
      $or: [
        { slug: { $in: uniTokens } },
        {
          name: {
            $in: uniTokens.map((s) => new RegExp(s.replace(/-/g, " "), "i")),
          },
        },
        ...uniTokens
          .filter((s) => mongoose.Types.ObjectId.isValid(s))
          .map((s) => ({ _id: s })),
      ],
    })
      .select("_id")
      .lean();

    if (uniDocs && uniDocs.length > 0) {
      const uniIds = uniDocs.map((u) => u._id);
      andConditions.push({ "universityOfferings.university": { $in: uniIds } });
    } else {
      andConditions.push({ _id: null });
    }
  }

  // ─── 4️⃣ Course Title / Slug Filter ────────────────────────────────────────
  const courseTokens = splitValues(course);
  if (courseTokens.length > 0) {
    andConditions.push({
      $or: [
        { slug: { $in: courseTokens } },
        {
          title: {
            $in: courseTokens.map((t) => new RegExp(t.replace(/-/g, " "), "i")),
          },
        },
        ...courseTokens
          .filter((c) => mongoose.Types.ObjectId.isValid(c))
          .map((c) => ({ _id: c })),
      ],
    });
  }

  // ─── 5️⃣ Duration Range Filter ─────────────────────────────────────────────
  const durationTokens = splitValues(duration);
  if (durationTokens.length > 0) {
    const durationOr = [];

    for (const durStr of durationTokens) {
      if (durStr === "06-month" || durStr === "0-6-months" || durStr === "6-month" || durStr === "0-6") {
        durationOr.push({ months: { $lte: 6 } });
      } else if (durStr === "06-12-months" || durStr === "6-12-months" || durStr === "6-12") {
        durationOr.push({ months: { $gte: 6, $lte: 12 } });
      } else if (durStr === "12-36-months" || durStr === "12-36-month" || durStr === "12-36" || durStr === "3-years") {
        durationOr.push({ months: { $gte: 12, $lte: 36 } });
      }

      durationOr.push({ slug: durStr });
      durationOr.push({ title: new RegExp(durStr.replace(/-/g, " "), "i") });
      if (mongoose.Types.ObjectId.isValid(durStr)) {
        durationOr.push({ _id: durStr });
      }
    }

    const durationDocs = await Duration.find({
      removed: false,
      $or: durationOr,
    })
      .select("_id")
      .lean();

    if (durationDocs && durationDocs.length > 0) {
      const durIds = durationDocs.map((d) => d._id);
      andConditions.push({
        $or: [
          { "universityOfferings.duration": { $in: durIds } },
          { "universityOfferings.subcourses.duration": { $in: durIds } },
        ],
      });
    } else {
      andConditions.push({ _id: null });
    }
  }

  // ─── 6️⃣ Fee Range Filter ──────────────────────────────────────────────────
  const feeTokens = splitValues(fee);
  if (feeTokens.length > 0) {
    const feeOr = [];

    for (const feeStr of feeTokens) {
      if (feeStr === "0-1-lakh" || feeStr === "0-100000" || feeStr === "1-lakh") {
        feeOr.push({ amount: { $gt: 0, $lte: 100000 } });
      } else if (feeStr === "1-2-lakh" || feeStr === "100000-200000") {
        feeOr.push({ amount: { $gt: 100000, $lte: 200000 } });
      } else if (feeStr === "2-5-lakh" || feeStr === "200000-500000") {
        feeOr.push({ amount: { $gt: 200000, $lte: 500000 } });
      } else if (feeStr === "5-10-lakh" || feeStr === "500000-1000000") {
        feeOr.push({ amount: { $gt: 500000, $lte: 1000000 } });
      } else if (feeStr === "above-10-lakh" || feeStr === "1000000+" || feeStr === "10-lakh+") {
        feeOr.push({ amount: { $gt: 1000000 } });
      }

      feeOr.push({ slug: feeStr });
      feeOr.push({ title: new RegExp(feeStr.replace(/-/g, " "), "i") });
      if (mongoose.Types.ObjectId.isValid(feeStr)) {
        feeOr.push({ _id: feeStr });
      }
    }

    const feeDocs = await Fee.find({
      removed: false,
      $or: feeOr,
    })
      .select("_id")
      .lean();

    if (feeDocs && feeDocs.length > 0) {
      const feeIds = feeDocs.map((f) => f._id);
      andConditions.push({
        $or: [
          { "universityOfferings.fee": { $in: feeIds } },
          { "universityOfferings.subcourses.fee": { $in: feeIds } },
        ],
      });
    } else {
      andConditions.push({ _id: null });
    }
  }

  // ─── 7️⃣ Featured Flag ────────────────────────────────────────────────────
  if (featured === "true" || featured === true) {
    partnerFilter.featured = true;
  }

  // ─── 8️⃣ Dynamic Text & Category Search ────────────────────────────────────
  if (search && search.trim().length > 0) {
    const rawSearch = search.trim();
    const cleanSearch = rawSearch.replace(/-/g, " ");
    const sRegex = new RegExp(cleanSearch.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");

    const matchingCats = await Category.find({
      removed: false,
      $or: [
        { name: sRegex },
        { slug: new RegExp(rawSearch.replace(/\s+/g, "-"), "i") },
      ],
    })
      .select("_id")
      .lean();

    const catIds = matchingCats.map((c) => c._id);

    const matchingUnis = await University.find({
      removed: false,
      $or: [
        { name: sRegex },
        { slug: new RegExp(rawSearch.replace(/\s+/g, "-"), "i") },
      ],
    })
      .select("_id")
      .lean();

    const uniIds = matchingUnis.map((u) => u._id);

    const searchOrConditions = [
      { title: sRegex },
      { slug: sRegex },
      { "universityOfferings.subcourses.title": sRegex },
    ];

    if (catIds.length > 0) {
      searchOrConditions.push({ categories: { $in: catIds } });
      searchOrConditions.push({ "universityOfferings.category": { $in: catIds } });
      searchOrConditions.push({ "universityOfferings.subcourses.category": { $in: catIds } });
    }

    if (uniIds.length > 0) {
      searchOrConditions.push({ "universityOfferings.university": { $in: uniIds } });
    }

    andConditions.push({ $or: searchOrConditions });
  }

  // Combine all conditions into Mongoose query
  if (andConditions.length > 0) {
    partnerFilter.$and = andConditions;
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

  request.courseFilter = {
    partnerFilter,
    mSort,
    pageNum,
    limitNum,
    skipNum,
  };
}

module.exports = { buildCourseFilter };
