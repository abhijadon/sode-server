"use strict";

const { getCache, setCache, clearAllCache } = require("../service/redis");

/**
 * Generate a normalized cache key independent of query parameter ordering
 * @param {object} request 
 * @returns {string}
 */
function getNormalizedCacheKey(request) {
  const rawUrl = request.raw?.url || request.url || "";
  const pathOnly = rawUrl.split("?")[0];

  const sortedQuery = {};
  if (request.query && typeof request.query === "object") {
    Object.keys(request.query)
      .sort()
      .forEach((key) => {
        sortedQuery[key] = request.query[key];
      });
  }

  return `sode:cache:${pathOnly}:${JSON.stringify(sortedQuery)}`;
}

/**
 * Creates a route-level Fastify cache preHandler and onSend hook.
 * @param {number} ttlSeconds - Time-To-Live in seconds (default: 3600s / 1 hour)
 */
function useCache(ttlSeconds = 3600) {
  return {
    preHandler: async (request, reply) => {
      // Only cache GET requests
      if (request.method !== "GET") return;

      const startTime = performance.now();
      request.startTime = startTime;

      // Create normalized cache key
      const cacheKey = getNormalizedCacheKey(request);
      request.cacheKey = cacheKey;

      try {
        const cachedPayload = await getCache(cacheKey);
        if (cachedPayload) {
          reply.header("Content-Type", "application/json; charset=utf-8");
          reply.header("X-Cache", "HIT");
          reply.header("Cache-Control", "public, max-age=300, s-maxage=600, stale-while-revalidate=60");
          request.isCached = true;
          const duration = (performance.now() - startTime).toFixed(2);
          console.log(`⚡ [REDIS HIT] (${duration}ms) 🚀 Served directly from Redis Cache: ${request.url}`);
          return reply.send(cachedPayload); // Directly responds with cached object
        }
      } catch (err) {
        console.warn(`⚠️ Cache preHandler warning for ${request.url}:`, err.message);
      }
    },

    onSend: async (request, reply, payload) => {
      // Skip if not GET, no cache key, or already served from cache
      if (request.method !== "GET" || !request.cacheKey || request.isCached) {
        return payload;
      }

      // Only cache successful 200 OK responses
      if (reply.statusCode === 200 && payload) {
        try {
          let rawString = payload;
          if (Buffer.isBuffer(payload)) {
            rawString = payload.toString("utf-8");
          }

          if (typeof rawString === "string") {
            // Validate payload is valid JSON before saving to Redis
            const parsedObj = JSON.parse(rawString);
            await setCache(request.cacheKey, parsedObj, ttlSeconds);
            reply.header("X-Cache", "MISS");
            reply.header("Cache-Control", "public, max-age=300, s-maxage=600, stale-while-revalidate=60");
            const duration = request.startTime ? (performance.now() - request.startTime).toFixed(2) : "0.00";
            console.log(`🍃 [MONGO DB] (${duration}ms) 💾 Fetched from MongoDB Database & Stored to Redis: ${request.url}`);
          }
        } catch (err) {
          // Silent catch to prevent response failure if payload isn't JSON
        }
      }
      return payload;
    }
  };
}

module.exports = {
  useCache,
  clearAllCache,
};
