"use strict";

const Fastify = require("fastify");
const cors = require("@fastify/cors");
const jwt = require("@fastify/jwt");
const router = require("./router");

const app = Fastify({
  logger: false,
});

// 1. CORS प्लगइन रजिस्ट्रेशन
app.register(cors, {
  origin: true,
  credentials: true,
});

// 2. JWT प्लगइन रजिस्ट्रेशन
app.register(jwt, {
  secret: process.env.JWT_SECRET,
});

app.register(router, { prefix: "/api" });

// 4. हेल्थ चेक एंडपॉइंट
app.get("/api/health/data", async () => {
  return {
    success: true,
    message: "Server is running",
  };
});

module.exports = app;
