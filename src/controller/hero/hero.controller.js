"use strict";

const { Hero } = require("../../model/Hero");

/**
 * Get dynamic Hero data for website page (e.g., page="home" or page="universities")
 */
async function getWebsiteHero(request, reply) {
  try {
    const page = request.query?.page || "home";

    const heroDoc = await Hero.findOne({
      page: page.toLowerCase(),
      enabled: true,
      removed: false,
    })
      .populate({
        path: "image",
        select: "_id name alt url",
        strictPopulate: false,
      })
      .populate({
        path: "bgImage",
        select: "_id name alt url",
        strictPopulate: false,
      })
      .populate({
        path: "mobileImage",
        select: "_id name alt url",
        strictPopulate: false,
      })
      .populate({
        path: "slides.image",
        select: "_id name alt url",
        strictPopulate: false,
      })
      .populate({
        path: "slides.bgImage",
        select: "_id name alt url",
        strictPopulate: false,
      })
      .populate({
        path: "slides.mobileImage",
        select: "_id name alt url",
        strictPopulate: false,
      })
      .sort({ order: 1 })
      .lean();

    if (!heroDoc) {
      return reply.code(200).send({
        success: true,
        result: null,
      });
    }

    return reply.code(200).send({
      success: true,
      result: heroDoc,
    });
  } catch (error) {
    console.error("❌ Error in getWebsiteHero:", error.message);
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch website hero data",
    });
  }
}

module.exports = {
  getWebsiteHero,
};
