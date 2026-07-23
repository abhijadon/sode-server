"use strict";

const { createClient } = require("redis");
const config = require("./redis.service");

const client = createClient({
  socket: {
    host: config.host,
    port: config.port,
    reconnectStrategy: (retries) => {
      return 5000;
    }
  },
  password: config.password,
});

let isConnected = false;
let hasLoggedError = false;

client.on("connect", () => {
  isConnected = true;
  hasLoggedError = false;
  console.log("🔌 Connected to Redis cache service successfully.");
});

client.on("error", (err) => {
  isConnected = false;
  if (!hasLoggedError) {
    hasLoggedError = true;
    console.warn("⚠️ Redis service offline (127.0.0.1:6379). Falling back to MongoDB queries smoothly.");
  }
});

client.on("end", () => {
  isConnected = false;
  console.log("🔌 Redis connection closed.");
});

// Self-invoking connection starter
(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error("❌ Redis initial connection failed:", err.message);
  }
})();

/**
 * Get item from cache
 * @param {string} key 
 * @returns {Promise<any|null>}
 */
async function getCache(key) {
  if (!isConnected) return null;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`⚠️ Redis GET failed for key "${key}":`, error.message);
    return null;
  }
}

/**
 * Set item in cache with TTL
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlSeconds 
 * @returns {Promise<boolean>}
 */
async function setCache(key, value, ttlSeconds = 300) {
  if (!isConnected) return false;
  try {
    const stringValue = JSON.stringify(value);
    await client.set(key, stringValue, {
      EX: ttlSeconds,
    });
    return true;
  } catch (error) {
    console.warn(`⚠️ Redis SET failed for key "${key}":`, error.message);
    return false;
  }
}

/**
 * Delete item from cache
 * @param {string} key 
 * @returns {Promise<boolean>}
 */
async function deleteCache(key) {
  if (!isConnected) return false;
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.warn(`⚠️ Redis DEL failed for key "${key}":`, error.message);
    return false;
  }
}

/**
 * Invalidate all cached API keys matching sode:cache:*
 * @returns {Promise<boolean>}
 */
async function clearAllCache() {
  if (!isConnected) return false;
  try {
    const keys = await client.keys("sode:cache:*");
    if (keys && keys.length > 0) {
      await client.del(keys);
      console.log(`🧹 [REDIS CACHE CLEARED] Invalidated ${keys.length} cached API endpoints.`);
    }
    return true;
  } catch (error) {
    console.warn("⚠️ Redis clear all cache error:", error.message);
    return false;
  }
}

module.exports = {
  client,
  getCache,
  setCache,
  deleteCache,
  clearAllCache,
};
