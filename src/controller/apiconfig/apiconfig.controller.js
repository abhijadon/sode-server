"use strict";

const { executeApiConfigByKey } = require("../../service/apiConfig/apiConfigExecutor");

/**
 * Executes an ApiConfig by its string key.
 */
async function executeApiConfig(request, reply) {
  try {
    const { key, payload } = request.body;

    if (!key) {
      return reply.code(400).send({
        success: false,
        message: "API config key is required",
      });
    }

    const options = {
      reqMeta: {
        ip: request.ip,
        userAgent: request.headers["user-agent"],
      },
    };

    const result = await executeApiConfigByKey(key, payload, options);

    return reply.code(result.statusCode || 200).send(result);
  } catch (error) {
    console.error("❌ Error executing api config:", error);
    return reply.code(500).send({
      success: false,
      message: "An error occurred while executing the API config",
      error: error.message,
    });
  }
}

module.exports = {
  executeApiConfig,
};
