"use strict";

const Fastify = require("fastify");
const cors = require("@fastify/cors");
const fastifyCookie = require("@fastify/cookie");
const router = require("./router");

const app = Fastify({
  logger: false,
});

// 1. CORS प्लगइन रजिस्ट्रेशन
app.register(cors, {
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

// 2. Cookie प्लगइन रजिस्ट्रेशन (राउट्स और मिडलवेयर से पहले होना ज़रूरी है)
app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || "my-cookie-fallback-secret",
  parseOptions: {},
});

// 2.5 Multipart File Upload प्लगइन रजिस्ट्रेशन
app.register(require("@fastify/multipart"), {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max file size
  },
  attachFieldsToBody: false,
});

// 3. डायनेमिक राउट्स रजिस्ट्रेशन
// (अब आप अपनेauthenticate मिडलवेयर को सीधे 'router' फ़ाइल के अंदर इम्पोर्ट करके राउट्स पर लगा सकते हैं)
app.register(router, { prefix: "/api" });

// 4. हेल्थ चेक एंडपॉइंट
app.get("/api/health/data", async () => {
  return {
    success: true,
    message: "Server is running perfectly with Cookie support",
  };
});

module.exports = app;
