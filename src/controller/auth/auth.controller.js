"use strict";

const { User } = require("../../model/User");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const useragent = require("useragent");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserLogs =
  mongoose.models.UserLogs ||
  mongoose.model("UserLogs", new mongoose.Schema({}, { strict: false }));

// ---------------- HELPERS ----------------

const sha256 = (str) => crypto.createHash("sha256").update(str).digest("hex");

function getDeviceTypeFromUA(userAgentString = "") {
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgentString);
  return isMobile ? "mobile" : "laptop";
}

function makeDeviceFingerprint(userAgentString = "") {
  const agent = useragent.parse(userAgentString);
  const parts = [
    userAgentString || "",
    agent.os?.toString?.() || "",
    agent.device?.toString?.() || "",
    agent.family || "",
  ].join("__");
  return sha256(parts);
}

// 🚀 प्योर JWT जनरेशन (बिना किसी sessionId के)
const generateAccessToken = async (user, primaryRole = "Member") => {
  const payload = {
    id: String(user._id),
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    isOwner: user.isOwner,
    role: primaryRole,
    workspace: user.workspace,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || "JWT_BACKUP_SECRET_KEY", {
    expiresIn: "2h",
  });
};

// ---------------- CONTROLLER ACTIONS ----------------

/**
 * 🔐 1. LOGIN CONTROLLER
 */
const login = async (request, reply) => {
  try {
    const { username, password, fcmToken } = request.body;

    const user = await User.findOne({
      $or: [{ username }, { email: username }, { phone: username }],
      removed: false,
    }).populate("role");

    if (user && user.enabled === false) {
      return reply.code(403).send({
        success: false,
        message: "Your account is disabled. Please contact the administrator.",
      });
    }

    let identifierType = "";
    if (/^\d{10}$/.test(username)) {
      identifierType = "phone";
    } else if (/^[\w.-]+@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(username)) {
      identifierType = "email";
    } else {
      identifierType = "username";
    }

    const userAgentString = request.headers["user-agent"] || "";
    const agent = useragent.parse(userAgentString);
    const deviceType = getDeviceTypeFromUA(userAgentString);
    const deviceFingerprint = makeDeviceFingerprint(userAgentString);

    const baseLogData = {
      ip: request.ip || null,
      device: agent.device?.toString?.() || "Unknown device",
      browser: agent.toAgent?.() || "Unknown browser",
      os: agent.os?.toString?.() || "Unknown OS",
      userAgent: userAgentString || null,
      deviceType,
      deviceFingerprint,
    };

    const saveUserLogs = async ({
      userId = null,
      status = "Failed",
      reason = null,
    }) => {
      try {
        const logEntry = {
          userId,
          ...baseLogData,
          loginStatus: status,
          failureReason: reason,
          login: new Date(),
        };
        await new UserLogs(logEntry).save();
      } catch (logErr) {
        console.error("Failed to save user log:", logErr.message);
      }
    };

    if (!user) {
      await saveUserLogs({
        reason: `No account found with this ${identifierType}`,
      });
      return reply.code(400).send({
        success: false,
        message: `No account found with this ${identifierType}`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await saveUserLogs({ userId: user._id, reason: "Invalid password" });
      return reply
        .code(401)
        .send({ success: false, message: "Invalid password" });
    }

    const primaryRole = user.role?.name || "Member";
    const permissions = Array.isArray(user.role?.action)
      ? user.role.action
      : ["read"];

    // 🎯 प्योर JWT जनरेशन (बिना सेशन आईडी के)
    const accessToken = await generateAccessToken(user, primaryRole);

    if (fcmToken && typeof fcmToken === "string") {
      user.fcmToken = Array.isArray(user.fcmToken) ? user.fcmToken : [];
      if (!user.fcmToken.includes(fcmToken)) {
        user.fcmToken.push(fcmToken);
      }
    }

    // स्टेटस अपडेट्स
    user.is_Online = true;
    user.lastSeen = new Date();
    await user.save();

    await saveUserLogs({
      userId: user._id,
      status: "Success",
    });

    // कुकी में टोकन सेट करें (HTTPS/Production detect)
    const isHttps =
      process.env.NODE_ENV === "production" ||
      request.headers["x-forwarded-proto"] === "https" ||
      request.protocol === "https";

    reply.setCookie("token", accessToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: isHttps ? "None" : "Lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return reply.code(200).send({
      success: true,
      result: {
        user: {
          id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          is_Online: user.is_Online,
          role: primaryRole,
          isAdmin: user.isAdmin,
          isSubadmin: user.isSubadmin,
          isOwner: user.isOwner,
          workspace: user.workspace,
          permissions,
        },
        accessToken,
      },
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Login error:", error);
    return reply.code(500).send({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * 🚪 2. LOGOUT CONTROLLER
 */
const logout = async (request, reply) => {
  try {
    // कुकी क्लियर करें
    const isHttps =
      process.env.NODE_ENV === "production" ||
      request.headers["x-forwarded-proto"] === "https" ||
      request.protocol === "https";

    reply.clearCookie("token", {
      path: "/",
      httpOnly: true,
      secure: isHttps,
      sameSite: isHttps ? "None" : "Lax",
    });

    const userId = request.user?._id || request.user?.id || null;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.is_Online = false;
        user.lastSeen = new Date();
        await user.save();

        // UserLogs में लास्ट लॉगआउट एंट्री अपडेट करें
        try {
          const activeLog = await UserLogs.findOne({
            userId: user._id,
            logout: null,
            loginStatus: "Success",
          }).sort({ login: -1 });

          if (activeLog) {
            const logoutTime = new Date();
            const sessionDuration = Math.floor(
              (logoutTime.getTime() - new Date(activeLog.login).getTime()) /
                1000,
            );

            activeLog.logout = logoutTime;
            activeLog.sessionDuration = sessionDuration;
            activeLog.autoLogout = false;
            await activeLog.save();
          }
        } catch (logErr) {}
      }
    }

    return reply.code(200).send({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logout function:", error);
    return reply.code(500).send({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = { login, logout };
