"use strict";

const fp = require("fastify-plugin");

/**
 * Fastify Plugin for Standardized API Responses
 * Uses Fastify native logger fastify.log.info
 */
async function responsePlugin(fastify, opts) {
  fastify.decorateReply("success", function (result = null, message = "Operation successful", statusCode = 200) {
    return this.code(statusCode).send({
      success: true,
      message,
      result,
    });
  });

  fastify.decorateReply("error", function (message = "An error occurred", statusCode = 500, error = null) {
    return this.code(statusCode).send({
      success: false,
      message,
      result: null,
      error: error || message,
    });
  });

  fastify.log.info("API Response Helper Plugin Registered Successfully!");
}

module.exports = fp(responsePlugin, {
  name: "fastify-response-plugin",
});
