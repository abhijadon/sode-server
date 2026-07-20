"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const { User } = require("../../model/User");
const { getAllReport } = require("./report_system");

const sha1 = (v) =>
  crypto.createHash("sha1").update(String(v)).digest("hex").slice(0, 16);

const getTokenFromReq = (req) => {
  const auth = req.headers?.authorization;
  if (auth) {
    const parts = auth.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") return parts[1];
  }
  if (req.cookies?.token) return req.cookies.token;
  return null;
};

const accesspermission = async (req, reply) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      return reply.code(401).send({ success: false, message: "Unauthorized" });
    }

    let userRoles = req.userResolvedRoles;
    let isAdminOrOwner = req.user?.isAdmin || req.user?.isOwner;

    if (!userRoles) {
      const user = await User.findById(req.user._id).populate("role");
      userRoles = Array.isArray(user?.roles)
        ? user.roles
        : [user?.role].filter(Boolean);
      isAdminOrOwner =
        isAdminOrOwner ||
        userRoles.some(
          (role) =>
            role &&
            role.name &&
            (role.name === "Admin" || role.name === "Owner")
        );
    } else {
      isAdminOrOwner =
        isAdminOrOwner ||
        userRoles.some(
          (role) =>
            role &&
            role.name &&
            (role.name === "Admin" || role.name === "Owner")
        );
    }

    let visibleUserIds = [];

    if (!isAdminOrOwner) {
      const hierarchyUserIds = await getAllReport([userId]);
      visibleUserIds = hierarchyUserIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    const workspaceIds = Array.isArray(req.user?.workspace)
      ? req.user.workspace
          .map((ws) => (ws?._id ? String(ws._id) : String(ws)))
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];

    const tenantId =
      req.user?.tenantId && mongoose.Types.ObjectId.isValid(req.user.tenantId)
        ? String(req.user.tenantId)
        : null;

    // Attach structured permission context to request
    req.userPermissionContext = {
      userId,
      isAdminOrOwner: Boolean(isAdminOrOwner),
      visibleUserIds,
      workspaceIds,
      tenantId,
      userRoles,
    };

    return;
  } catch (err) {
    console.error("Error in accesspermission middleware:", err);
    return reply.code(500).send({
      success: false,
      message: "Error determining access permissions",
      error: err.message,
    });
  }
};

module.exports = { accesspermission };
