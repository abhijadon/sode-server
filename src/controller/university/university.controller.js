"use strict";

const { PartnerUniversity } = require("../../model/PartnerUniversity");

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

module.exports = {
  getWebsiteUniversities,
};
