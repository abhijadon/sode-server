"use strict";

const { User } = require("../../model/User");

/**
 * ✅ Cache helpers check
 */
const hasRedisHelpers = (redis) =>
  redis &&
  typeof redis.getJSON === "function" &&
  typeof redis.setJSON === "function" &&
  typeof redis.generateCacheKey === "function";

/**
 * ✅ Recursive function (DB version) to get all report IDs
 */
const getAllReport = async (userIds, visited = new Set()) => {
  let allIds = [];

  for (const userId of userIds) {
    const key = String(userId);
    if (visited.has(key)) continue;

    visited.add(key);
    allIds.push(userId);

    const directReports = await User.find({ reportsTo: userId, removed: false })
      .select("_id")
      .lean();

    const reportIds = directReports.map((u) => u._id);

    if (reportIds.length > 0) {
      const deeperReports = await getAllReport(reportIds, visited);
      allIds = allIds.concat(deeperReports);
    }
  }

  return allIds;
};

/**
 * ✅ Middleware function to apply reporting hierarchy system
 */
const report_system = async (req, reply) => {
  const totalStart = process.hrtime.bigint();

  try {
    const currentUser = req.user;

    if (!currentUser) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    // Admin / Owner → skip hierarchy restriction
    if (Boolean(currentUser.isAdmin) || Boolean(currentUser.isOwner)) {
      req.allReportIds = null;
      return;
    }

    const redis = req.server?.redis;
    const refresh = req.query?.refresh === "true";
    const userId = currentUser._id?.toString() || currentUser.id?.toString();

    if (!userId) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized: Invalid user",
      });
    }

    const redisOk = hasRedisHelpers(redis);

    const cacheKey = redisOk
      ? redis.generateCacheKey("report_system_hierarchy", userId, {}, {})
      : null;

    // 1️⃣ Redis HIT
    if (redisOk && cacheKey && !refresh) {
      try {
        const cached = await redis.getJSON(cacheKey);
        if (cached && Array.isArray(cached.allReportIds)) {
          req.allReportIds = cached.allReportIds;
          return;
        }
      } catch (e) {}
    }

    // 2️⃣ DB compute
    const allReportIdsObj = await getAllReport([currentUser._id]);
    const allReportIds = allReportIdsObj.map((id) => id.toString());

    req.allReportIds = allReportIds;

    // 3️⃣ Cache set
    if (redisOk && cacheKey) {
      try {
        await redis.setJSON(cacheKey, { allReportIds }, 300);
      } catch (e) {}
    }

    return;
  } catch (err) {
    console.error("Error in report_system:", err.message);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error (Hierarchy Middleware)",
      error: err.message,
    });
  }
};

module.exports = { report_system, getAllReport };
