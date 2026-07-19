"use strict";

const { University } = require("../../model/University");

async function getWebsiteUniversities(request, reply) {
  try {
    const universities = await University.find({ removed: false, enabled: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return reply.code(200).send({
      success: true,
      result: universities && universities.length > 0 ? universities : [],
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
