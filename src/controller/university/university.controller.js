"use strict";

const { PartnerUniversity } = require("../../model/PartnerUniversity");
const { University } = require("../../model/University");

async function getWebsiteUniversities(request, reply) {
  try {
    const universities = await PartnerUniversity.find({ removed: false, enabled: true })
      .populate({
        path: "university",
        select: "_id name slug logoSrc imageSrc",
        populate: [
          { path: "logoSrc", select: "_id name url alt" },
          { path: "imageSrc", select: "_id name url alt" },
        ],
      })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const formatted = (universities || []).map((p) => {
      const u = p.university && typeof p.university === "object" ? p.university : {};
      return {
        _id: p._id,
        university: u,
        name: u.name || "",
        slug: u.slug || "",
        logoSrc: u.logoSrc,
        imageSrc: u.imageSrc,
        courses: p.courses || [],
        brochureUrl: p.brochureUrl || "",
        paragraphs: p.paragraphs || [],
        featured: p.featured || false,
        order: p.order || 0,
        enabled: p.enabled !== false,
      };
    });

    return reply.code(200).send({
      success: true,
      result: formatted,
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch website universities",
    });
  }
}

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

    // 1️⃣ Find base University documents matching slugs
    const baseUnis = await University.find({
      slug: { $in: slugArray },
      removed: false,
    }).lean();

    const baseUniIds = baseUnis.map((u) => u._id);

    // 2️⃣ Find PartnerUniversity records with populated Courses, Fees & Media
    const partnerUnis = await PartnerUniversity.find({
      university: { $in: baseUniIds },
      removed: false,
    })
      .populate({
        path: "university",
        select: "_id name slug logoSrc imageSrc",
        populate: [
          { path: "logoSrc", select: "_id name url alt" },
          { path: "imageSrc", select: "_id name url alt" },
        ],
      })
      .populate({
        path: "courses",
        select: "_id title slug logo image fee brochureUrl syllabus careers",
        populate: [
          { path: "fee", select: "_id title amount currency slug" },
          { path: "logo", select: "_id name url alt" },
        ],
      })
      .lean();

    const result = partnerUnis.map((pu) => {
      const u = pu.university && typeof pu.university === "object" ? pu.university : {};
      const courseList = Array.isArray(pu.courses) ? pu.courses : [];

      return {
        _id: pu._id,
        universityId: u._id,
        name: u.name || "University",
        slug: u.slug || "",
        logoSrc: u.logoSrc || null,
        imageSrc: u.imageSrc || null,
        brochureUrl: pu.brochureUrl || "",
        paragraphs: pu.paragraphs || [],
        location: pu.location || "India / Global",
        established: pu.established || "2000",
        approvals: (pu.approvals && pu.approvals.length > 0) ? pu.approvals : ["UGC", "DEB", "WES", "AICTE"],
        rating: pu.rating || 4.8,
        reviewsCount: pu.reviewsCount || 350,
        examMode: pu.examMode || "100% Online / Assignment-Based",
        emiStarts: pu.emiStarts || "₹4,999/month",
        courses: courseList.map((c) => ({
          _id: c._id,
          title: c.title,
          slug: c.slug,
          fee: c.fee ? (typeof c.fee === "object" ? c.fee?.title || `₹${c.fee?.amount}` : c.fee) : "Flexible",
        })),
      };
    });

    return reply.code(200).send({
      success: true,
      result,
    });
  } catch (error) {
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
