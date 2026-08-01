"use strict";

const fp = require("fastify-plugin");
const { getCache, setCache, clearAllCache, isRedisConnected, redisClient } = require("../service/redis");

/**
 * Fastify Plugin for Redis Caching Services
 * Uses Fastify native logger fastify.log.info
 */
async function redisPlugin(fastify, opts) {
  fastify.decorate("redis", redisClient);
  fastify.decorate("getCache", getCache);
  fastify.decorate("setCache", setCache);
  fastify.decorate("clearCache", clearAllCache);
  fastify.decorate("isRedisConnected", isRedisConnected);

  fastify.log.info("Redis Caching Plugin Registered Successfully!");

  fastify.addHook("onClose", async (instance) => {
    try {
      if (redisClient && typeof redisClient.quit === "function") {
        fastify.log.info("Closing Redis client connection...");
        await redisClient.quit();
        fastify.log.info("Redis client disconnected gracefully.");
      }
    } catch (err) {
      fastify.log.warn(`Redis disconnect warning: ${err.message}`);
    }
  });
}

module.exports = fp(redisPlugin, {
  name: "fastify-redis-cache-plugin",
});
