"use strict";

const { executeApiConfigByKey, executeApiEvent } = require("../../service/apiConfig/apiConfigExecutor");

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

/**
 * Triggers all active ApiConfigs for a specific event
 */
async function triggerApiEvent(request, reply) {
  try {
    const { event, payload } = request.body;

    if (!event) {
      return reply.code(400).send({
        success: false,
        message: "API config event is required",
      });
    }

    const options = {
      reqMeta: {
        ip: request.ip,
        userAgent: request.headers["user-agent"],
      },
    };

    const result = await executeApiEvent(event, payload, options);
    return reply.code(200).send(result);
  } catch (error) {
    console.error("❌ Error triggering api event:", error);
    return reply.code(500).send({
      success: false,
      message: "An error occurred while triggering the API configs",
      error: error.message,
    });
  }
}

module.exports = {
  executeApiConfig,
  triggerApiEvent,
};
