"use strict";

const { PageMeta } = require("../../model/PageMeta");

async function getWebsitePageMeta(request, reply) {
  try {
    const pagePath = request.query?.path || "/";

    const meta = await PageMeta.findOne({
      pagePath,
      removed: false,
      enabled: true,
    }).lean();

    return reply.code(200).send({
      success: true,
      result: meta || null,
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch page metadata",
    });
  }
}

module.exports = {
  getWebsitePageMeta,
};
