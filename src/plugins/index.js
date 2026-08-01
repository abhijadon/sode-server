"use strict";

const fp = require("fastify-plugin");
const mongoosePlugin = require("./mongoose.plugin");
const redisPlugin = require("./redis.plugin");
const authPlugin = require("./auth.plugin");
const responsePlugin = require("./response.plugin");

/**
 * Master Centralized Fastify Plugins Index
 * Registers all infrastructure & service plugins wrapped with fastify-plugin.
 * Enables global decorators for Mongoose DB, Redis Cache, Auth, and Reply Helpers.
 */
async function registerPlugins(fastify, opts) {
  await fastify.register(mongoosePlugin);
  await fastify.register(redisPlugin);
  await fastify.register(authPlugin);
  await fastify.register(responsePlugin);
}

module.exports = fp(registerPlugins, {
  name: "sode-master-plugins-index",
});
