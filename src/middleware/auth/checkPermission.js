"use strict";

const crypto = require("crypto");
const { Role } = require("../../model/Role");

// ✅ stable short hash
const sha1 = (v) =>
  crypto.createHash("sha1").update(String(v)).digest("hex").slice(0, 16);

// ✅ normalize role ids
const normalizeRoleIds = (roles) => {
  if (!roles) return [];

  if (Array.isArray(roles)) {
    return roles
      .map((r) =>
        typeof r === "string" ? r : r?._id?.toString() || r?.toString()
      )
      .filter(Boolean);
  }

  if (typeof roles === "string") return [roles];

  if (typeof roles === "object") {
    if (roles?._id) return [roles._id.toString()];
    if (typeof roles.toString === "function") return [roles.toString()];
  }

  return [];
};

/**
 * ✅ Robust checkPermission middleware
 */
const checkPermission = (requiredAction, options = {}) => {
  return async (request, reply) => {
    try {
      const user = request.user || {};
      const isAdmin = Boolean(user.isAdmin);
      const isOwner = Boolean(user.isOwner);
      const isSubadmin = Boolean(user.isSubadmin);

      // ✅ Admin / Owner / Subadmin Full Bypass
      if (isAdmin || isOwner || isSubadmin) return;

      // Extract resolved roles directly from user object if populated
      let resolvedRoles =
        Array.isArray(user.roles) && user.roles.length > 0
          ? user.roles
          : user.role
          ? [user.role]
          : [];

      // If roles are ObjectIds (strings) instead of populated objects, fetch from DB
      const hasPopulatedActions = resolvedRoles.some(
        (r) => r && (r.action || r.actions)
      );

      if (!hasPopulatedActions) {
        const roleIds = normalizeRoleIds(user.roles || user.role);
        if (!roleIds || roleIds.length === 0) {
          return reply.code(403).send({
            success: false,
            message: "Access denied: No roles assigned.",
          });
        }

        const rolesFromDb = await Role.find({
          _id: { $in: roleIds },
          removed: false,
        })
          .select(
            "_id name removed enabled action actions workspaces description des"
          )
          .lean();

        if (rolesFromDb && rolesFromDb.length > 0) {
          resolvedRoles = rolesFromDb;
        }
      }

      if (!resolvedRoles || resolvedRoles.length === 0) {
        return reply.code(403).send({
          success: false,
          message: "Access denied: No valid roles found.",
        });
      }

      // 🔐 ACTION PERMISSION ENGINE
      if (requiredAction) {
        const workspaceId =
          request.query?.workspace ||
          request.body?.workspace ||
          request.params?.workspaceId;

        const hasPermission = resolvedRoles.some((role) => {
          if (!role || role.enabled === false) return false;

          const roleName = String(role.name || "").toLowerCase();
          if (
            roleName === "admin" ||
            roleName === "owner" ||
            roleName === "subadmin"
          ) {
            return true;
          }

          const actionsList = Array.isArray(role.action)
            ? role.action
            : Array.isArray(role.actions)
            ? role.actions
            : typeof role.action === "string"
            ? [role.action]
            : [];

          const lowerActions = actionsList.map((a) => String(a).toLowerCase());

          // Match direct action, 'write', 'all', or '*'
          if (
            lowerActions.includes(requiredAction.toLowerCase()) ||
            lowerActions.includes("write") ||
            lowerActions.includes("all") ||
            lowerActions.includes("*")
          ) {
            return true;
          }

          // Check Workspace Specific Permissions
          if (
            workspaceId &&
            Array.isArray(role.workspaces) &&
            role.workspaces.length > 0
          ) {
            const workspaceEntry = role.workspaces.find(
              (w) => w.workspaceId?.toString() === workspaceId.toString()
            );
            if (workspaceEntry && Array.isArray(workspaceEntry.permissions)) {
              const wsLower = workspaceEntry.permissions.map((p) =>
                String(p).toLowerCase()
              );
              if (
                wsLower.includes(requiredAction.toLowerCase()) ||
                wsLower.includes("write") ||
                wsLower.includes("all") ||
                wsLower.includes("*")
              ) {
                return true;
              }
            }
          }

          return false;
        });

        if (!hasPermission) {
          return reply.code(403).send({
            success: false,
            message: `Access denied: User lacks the '${requiredAction}' privilege.`,
          });
        }
      }

      request.userResolvedRoles = resolvedRoles;
      return;
    } catch (error) {
      console.error("Permission check error:", error);
      return reply.code(500).send({
        success: false,
        message: "Internal server error during permission check.",
        error: error.message,
      });
    }
  };
};

module.exports = { checkPermission };
