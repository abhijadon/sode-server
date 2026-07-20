"use strict";

const { SiteSetting } = require("../../model/SiteSetting");

async function getWebsiteSiteSetting(request, reply) {
  try {
    const setting = await SiteSetting.findOne({
      settingKey: "default_site_setting",
      removed: false,
      enabled: true,
    }).lean();

    return reply.code(200).send({
      success: true,
      result: setting || null,
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch website site setting",
    });
  }
}

module.exports = {
  getWebsiteSiteSetting,
};
