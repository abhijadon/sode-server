"use strict";

const jwt = require("jsonwebtoken");
const { User } = require("../../model/User");

// ✅ get token from header/cookie
function getToken(request) {
  let token = null;

  // 1) HEADER -> Authorization: Bearer <token>
  if (request.headers.authorization) {
    const parts = request.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") token = parts[1];
  }

  // 2) COOKIE -> token=<token>
  if (!token && request.cookies && request.cookies.token) {
    token = request.cookies.token;
  }

  return token;
}

const authenticate = async (request, reply) => {
  try {
    const token = getToken(request);

    // 1️⃣ अगर टोकन नहीं मिला
    if (!token) {
      return reply.code(401).send({
        success: false,
        result: null,
        message: "Access Denied. No authentication token found.",
        tokenExpired: true,
      });
    }

    // 2️⃣ Secure JWT Verification
    let decoded = null;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "JWT_BACKUP_SECRET_KEY",
      );
    } catch (err) {
      return reply.code(401).send({
        success: false,
        result: null,
        message: "Unauthorized access. Invalid or expired token.",
        tokenExpired: true,
      });
    }

    if (!decoded || !decoded.id) {
      return reply.code(401).send({
        success: false,
        result: null,
        message: "Token verification failed.",
        tokenExpired: true,
      });
    }

    // 3️⃣ डेटाबेस से सिर्फ यूजर चेक करें (कोई सेशन एरे वैलिडेशन नहीं)
    const user = await User.findOne({
      _id: decoded.id,
      removed: false,
      enabled: true,
    }).populate("role");

    if (!user) {
      return reply.code(401).send({
        success: false,
        result: null,
        message: "User account no longer exists or is disabled.",
        tokenExpired: true,
      });
    }

    // ✅ request.user को सीधे ऑब्जेक्ट फॉर्मेट में सेट करें
    request.user = {
      _id: String(user._id),
      id: String(user._id),
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isOwner: user.isOwner,
      role: user.role?.name || "Member",
      workspace: user.workspace,
    };

    // यूज़र की lastSeen फील्ड को बैकग्राउंड में अपडेट करें
    try {
      user.lastSeen = new Date();
      user.is_Online = true;
      await user.save();
    } catch (e) {}

    return;
  } catch (error) {
    console.error("Authentication Middleware Error:", error.message);
    return reply.code(500).send({
      success: false,
      result: null,
      message: "Internal Server Error during authentication.",
      error: error.message,
    });
  }
};

module.exports = { authenticate };
