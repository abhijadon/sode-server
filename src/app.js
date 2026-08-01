"use strict";

const Fastify = require("fastify");
const cors = require("@fastify/cors");
const fastifyCookie = require("@fastify/cookie");
const fastifyMultipart = require("@fastify/multipart");
const router = require("./router");
const plugins = require("./plugins");

/**
 * Fastify Application Factory Plugin Builder
 * Creates and configures the complete Fastify Application instance with all plugins & routes registered in order.
 * @param {object} opts - Fastify initialization options
 * @returns {Promise<import("fastify").FastifyInstance>}
 */
async function buildApp(opts = {}) {
  const app = Fastify({
    logger: opts.logger !== undefined ? opts.logger : { level: "info" },
    ...opts,
  });

  // 1. CORS Plugin Registration
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cookie",
      "Set-Cookie",
    ],
    exposedHeaders: ["Set-Cookie"],
  });

  // 2. Cookie Plugin Registration
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || "my-cookie-fallback-secret",
    parseOptions: {},
  });

  // 3. Multipart File Upload Plugin Registration
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100 MB max file size
    },
    attachFieldsToBody: false,
  });

  // 4. Infrastructure & Custom Fastify Plugins (Mongoose DB, Redis Cache, Auth, Response Helpers)
  await app.register(plugins);

  // 5. Dynamic API Routes (/api)
  await app.register(router, { prefix: "/api" });

  // 6. Health Check Endpoint
  app.get("/api/health/data", async () => {
    return {
      success: true,
      message: "Server is running perfectly with Fastify Plugin support",
    };
  });

  return app;
}

module.exports = buildApp;
