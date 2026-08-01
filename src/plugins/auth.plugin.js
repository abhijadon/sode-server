"use strict";

const fp = require("fastify-plugin");
const { authenticate, getToken } = require("../middleware/auth/authenticate");

/**
 * Fastify Plugin for JWT Authentication
 * Uses Fastify native logger fastify.log.info
 */
async function authPlugin(fastify, opts) {
  fastify.decorate("authenticate", authenticate);
  fastify.decorate("getToken", getToken);
  fastify.decorateRequest("user", null);

  fastify.log.info("JWT Authentication Plugin Registered Successfully!");
}

module.exports = fp(authPlugin, {
  name: "fastify-auth-plugin",
});
