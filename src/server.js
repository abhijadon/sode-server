"use strict";

require("module-alias/register");
require("dotenv").config();
const buildApp = require("@/app");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

/**
 * Server Startup Bootstrapper
 * Initializes Fastify Application Factory and starts listening on PORT/HOST.
 */
async function startServer() {
  try {
    const app = await buildApp();
    app.log.info("Starting Fastify server initialization sequence...");

    await app.listen({
      port: PORT,
      host: HOST,
    });

    app.log.info(`⚡ Fastify Server running on http://${HOST}:${PORT}`);
  } catch (error) {
    console.error("❌ STARTUP ERROR DETAILS:", error);
    process.exit(1);
  }
}

startServer();