"use strict";

const { Page } = require("../../model/Page");

async function getWebsitePageBySlug(request, reply) {
  try {
    const slug = request.query?.slug;
    if (!slug) {
      return reply.code(400).send({
        success: false,
        message: "Slug query parameter is required",
      });
    }

    const page = await Page.findOne({
      slug: slug.toLowerCase(),
      removed: false,
      enabled: true,
    })
      .populate({
        path: "associatedCourse",
        select: "title slug logo image",
      })
      .populate({
        path: "associatedUniversity",
        select: "name slug logoSrc imageSrc",
      })
      .lean();

    return reply.code(200).send({
      success: true,
      result: page || null,
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch website page by slug",
    });
  }
}

module.exports = {
  getWebsitePageBySlug,
};
