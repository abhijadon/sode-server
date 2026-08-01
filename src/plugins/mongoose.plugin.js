"use strict";

const fp = require("fastify-plugin");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");

/**
 * Fastify Plugin for MongoDB / Mongoose Connection Management
 * Uses Fastify native logger fastify.log.info
 */
async function mongoosePlugin(fastify, opts) {
  try {
    const dbInstance = await connectDB({ logger: fastify.log });

    fastify.decorate("mongoose", mongoose);
    fastify.decorate("db", dbInstance);

    fastify.log.info("MongoDB Connected Successfully via Mongoose!");

    fastify.addHook("onClose", async (instance) => {
      if (mongoose.connection.readyState !== 0) {
        fastify.log.info("Closing Mongoose database connection...");
        await mongoose.disconnect();
        fastify.log.info("Mongoose disconnected gracefully.");
      }
    });
  } catch (err) {
    fastify.log.error(`Failed to connect MongoDB via Mongoose: ${err.message}`);
    throw err;
  }
}

module.exports = fp(mongoosePlugin, {
  name: "fastify-mongoose-plugin",
});
