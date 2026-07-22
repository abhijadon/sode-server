"use strict";

const mongoose = require("mongoose");
const { PartnerUniversity } = require("../../model/PartnerUniversity");
const { University } = require("../../model/University");
const { Category } = require("../../model/Category");

/**
 * GET /partneruniversities/website-list
 *
 * PartnerUniversity schema fields used:
 *   - university       → ref: University { name, slug, logoSrc→Media, imageSrc→Media }
 *   - courses[]        → ref: Course { title, slug }
 *   - type             (String — on PartnerUniversity, NOT University)
 *   - location         (String)
 *   - approvals[]      (String[])
 *   - rating           (Number)
 *   - reviewsCount     (Number)
 *   - brochureUrl      (String)
 *   - paragraphs[]     (String[])
 *   - featured         (Boolean)
 *   - order            (Number)
 *
 * Media model fields: { _id, name, alt, url }
 * Course model fields used: { _id, title, slug }
 */
async function getWebsiteUniversities(request, reply) {
  try {
    const { limit, page, type, category } = request.query || {};

    const filter = { removed: false, enabled: true };

    if (category && category !== "all") {
      const foundCat = await Category.findOne({
        removed: false,
        $or: [
          { slug: category },
          ...(mongoose.Types.ObjectId.isValid(category) ? [{ _id: category }] : []),
        ],
      }).lean();

      if (foundCat) {
        const childCats = await Category.find({
          removed: false,
          parentId: foundCat._id,
        }).select("_id").lean();

        const catIds = [foundCat._id, ...childCats.map((c) => c._id)];

        const matchingBaseUnis = await University.find({
          removed: false,
          $or: [
            { category: { $in: catIds } },
            { categories: { $in: catIds } },
          ],
        }).select("_id").lean();

        const baseUniIds = matchingBaseUnis.map((u) => u._id);

        filter.$or = [
          { category: { $in: catIds } },
          { categories: { $in: catIds } },
          { university: { $in: baseUniIds } },
        ];
      }
    }

    if (type) {
      const matchingUnis = await University.find({
        name: new RegExp(type, "i"),
        removed: false,
        enabled: true
      }).select("_id");
      
      const uniIds = matchingUnis.map(u => u._id);
      
      filter.$or = [
        ...(filter.$or || []),
        { type: new RegExp(`^${type}$`, "i") },
        { university: { $in: uniIds } }
      ];
    }

    const limitNum = parseInt(limit, 10) || 0;
    const pageNum = parseInt(page, 10) || 1;

    let query = PartnerUniversity.find(filter)
      .populate({
        path: "category",
        select: "_id name slug title description logo logoSrc",
        strictPopulate: false,
      })
      .populate({
        path: "categories",
        select: "_id name slug title description logo logoSrc",
        strictPopulate: false,
      })
      .populate({
        path: "university",
        select: "_id name slug logoSrc imageSrc category categories",
        populate: [
          { path: "logoSrc",  select: "_id name alt url", strictPopulate: false },
          { path: "imageSrc", select: "_id name alt url", strictPopulate: false },
          { path: "category", select: "_id name slug title", strictPopulate: false },
        ],
        strictPopulate: false,
      })
      .populate({
        path: "courses",
        select: "_id title slug duration eligibility",
        populate: [
          { path: "duration", select: "_id title slug months" },
          { path: "eligibility", select: "_id title slug" },
        ],
        strictPopulate: false,
      })
      .sort({ order: 1, createdAt: 1 });

    if (limitNum > 0) {
      const skip = (pageNum - 1) * limitNum;
      query = query.skip(skip).limit(limitNum);
    }

    const partnerUnis = await query.lean();

    const formatted = (partnerUnis || []).map((p) => {
      const u = p.university && typeof p.university === "object" ? p.university : {};

      // logoSrc: populated Media object → { _id, name, alt, url }
      const logoSrc  = u.logoSrc  && typeof u.logoSrc  === "object" ? u.logoSrc  : null;
      const imageSrc = u.imageSrc && typeof u.imageSrc === "object" ? u.imageSrc : null;

      // courses: filter only properly populated objects (not raw ObjectIds)
      const courseList = Array.isArray(p.courses)
        ? p.courses.filter((c) => c && typeof c === "object" && c.title)
        : [];

      const featuredCourse = courseList.length > 0 ? courseList[0].title : null;

      return {
        _id:           p._id,
        // University identity (flat — no nested university object to avoid duplication)
        name:          u.name  || "",
        slug:          u.slug  || "",
        // Media — only once, at top level
        logoSrc,
        imageSrc,
        // PartnerUniversity specific fields
        type:          p.type        || "Global",
        location:      p.location    || "Accredited Campus",
        approvals:     Array.isArray(p.approvals) && p.approvals.length > 0 ? p.approvals : [],
        rating:        typeof p.rating       === "number" ? p.rating       : 4.8,
        reviewsCount:  typeof p.reviewsCount === "number" ? p.reviewsCount : 250,
        // Courses
        featuredCourse,
        courses: courseList.map((c) => ({
          _id:   c._id,
          title: c.title,
          slug:  c.slug,
        })),
        brochureUrl: p.brochureUrl || "",
        paragraphs:  p.paragraphs  || [],
        featured:    p.featured    || false,
        order:       p.order       || 0,
        enabled:     p.enabled !== false,
      };
    });

    return reply.code(200).send({
      success: true,
      result: formatted,
    });
  } catch (error) {
    console.error("❌ Error in getWebsiteUniversities:", error.message);
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch website universities",
    });
  }
}

/**
 * GET /partneruniversities/compare?slugs=slug1,slug2
 */
async function getWebsiteUniversitiesCompare(request, reply) {
  try {
    const { slugs } = request.query || {};
    if (!slugs) {
      return reply.code(400).send({
        success: false,
        message: "University slugs query parameter is required (e.g. ?slugs=ggu,rushford)",
      });
    }

    const slugArray = String(slugs)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    // Find base University documents matching slugs
    const baseUnis = await University.find({
      slug: { $in: slugArray },
      removed: false,
    }).lean();

    const baseUniIds = baseUnis.map((u) => u._id);

    // Find PartnerUniversity records with populated data
    const partnerUnis = await PartnerUniversity.find({
      university: { $in: baseUniIds },
      removed: false,
    })
      .populate({
        path: "university",
        select: "_id name slug logoSrc imageSrc",
        populate: [
          { path: "logoSrc",  select: "_id name alt url", strictPopulate: false },
          { path: "imageSrc", select: "_id name alt url", strictPopulate: false },
        ],
        strictPopulate: false,
      })
      .populate({
        path: "courses",
        select: "_id title slug logo image fee brochureUrl syllabus careers",
        populate: [
          { path: "fee",   select: "_id title amount currency slug", strictPopulate: false },
          { path: "logo",  select: "_id name alt url",               strictPopulate: false },
          { path: "image", select: "_id name alt url",               strictPopulate: false },
        ],
        strictPopulate: false,
      })
      .lean();

    const result = partnerUnis.map((pu) => {
      const u = pu.university && typeof pu.university === "object" ? pu.university : {};
      const logoSrc  = u.logoSrc  && typeof u.logoSrc  === "object" ? u.logoSrc  : null;
      const imageSrc = u.imageSrc && typeof u.imageSrc === "object" ? u.imageSrc : null;

      const courseList = Array.isArray(pu.courses)
        ? pu.courses.filter((c) => c && typeof c === "object" && c.title)
        : [];

      return {
        _id:          pu._id,
        universityId: u._id,
        name:         u.name || "University",
        slug:         u.slug || "",
        logoSrc,
        imageSrc,
        type:         pu.type        || "Global",
        brochureUrl:  pu.brochureUrl || "",
        paragraphs:   pu.paragraphs  || [],
        location:     pu.location    || "India / Global",
        established:  pu.established || "2000",
        approvals:    Array.isArray(pu.approvals) && pu.approvals.length > 0
                        ? pu.approvals
                        : [],
        rating:       typeof pu.rating === "number" ? pu.rating : 4.8,
        reviewsCount: typeof pu.reviewsCount === "number" ? pu.reviewsCount : 350,
        examMode:     pu.examMode  || "100% Online / Assignment-Based",
        emiStarts:    pu.emiStarts || "₹4,999/month",
        courses: courseList.map((c) => ({
          _id:   c._id,
          title: c.title,
          slug:  c.slug,
          fee:   c.fee && typeof c.fee === "object"
                   ? (c.fee.title || (c.fee.amount ? `₹${c.fee.amount}` : "Flexible"))
                   : "Flexible",
          logo:  c.logo  && typeof c.logo  === "object" ? c.logo  : null,
          image: c.image && typeof c.image === "object" ? c.image : null,
        })),
      };
    });

    return reply.code(200).send({
      success: true,
      result,
    });
  } catch (error) {
    console.error("❌ Error in getWebsiteUniversitiesCompare:", error.message);
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch university comparison data",
    });
  }
}

module.exports = {
  getWebsiteUniversities,
  getWebsiteUniversitiesCompare,
};
