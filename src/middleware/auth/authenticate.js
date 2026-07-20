"use strict";

const jwt = require("jsonwebtoken");
const { User } = require("../../model/User");

// ✅ Helper to extract token from Header (Bearer) or Cookie (token)
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
        process.env.JWT_SECRET || "JWT_BACKUP_SECRET_KEY"
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

    // 3️⃣ Fetch User from DB with populated Role
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

    const roleId = user.role?._id ? String(user.role._id) : user.role ? String(user.role) : null;
    const roleName = user.role?.name || "Member";

    // ✅ request.user populated cleanly with roleId and roleName
    request.user = {
      _id: String(user._id),
      id: String(user._id),
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      isAdmin: Boolean(user.isAdmin),
      isOwner: Boolean(user.isOwner),
      isSubadmin: Boolean(user.isSubadmin),
      roleId: roleId,
      roleName: roleName,
      role: user.role,
      roles: user.role ? [user.role] : [],
      workspace: user.workspace || [],
      tenantId: user.tenantId ? String(user.tenantId) : null,
      reportsTo: user.reportsTo ? String(user.reportsTo) : null,
    };

    // Update lastSeen and online status in background
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

module.exports = { authenticate, getToken };
