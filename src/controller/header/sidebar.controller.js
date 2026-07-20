"use strict";

const { Sidebar } = require("../../model/Sidebar");

const getSidebar = async (request, reply) => {
  try {
    const currentUser = request.user || {};
    const isAdminOrOwner = Boolean(currentUser.isAdmin || currentUser.isOwner);

    // 1. FETCH FLAT SIDEBAR ITEMS WITH POPULATED ROLES
    const flatSidebar = await Sidebar.find({
      removed: false,
      enabled: true,
    })
      .populate("roles", "_id name")
      .select(
        "title section sectionOrder itemOrder icon path parentId target newTab badge roles enabled removed"
      )
      .sort({ sectionOrder: 1, itemOrder: 1 })
      .lean();

    // 2. EXTRACT CURRENT USER ROLE IDS & ROLE NAMES
    const userRoleIds = new Set();
    const userRoleNames = new Set();

    if (currentUser) {
      if (currentUser.isAdmin) userRoleNames.add("Admin");
      if (currentUser.isOwner) userRoleNames.add("Owner");
      if (currentUser.isSubadmin) userRoleNames.add("Subadmin");

      if (currentUser.roleId) userRoleIds.add(String(currentUser.roleId));
      if (currentUser.roleName) userRoleNames.add(currentUser.roleName);

      if (currentUser.role) {
        if (typeof currentUser.role === "string") {
          userRoleIds.add(currentUser.role);
        } else if (typeof currentUser.role === "object") {
          if (currentUser.role._id) userRoleIds.add(String(currentUser.role._id));
          if (currentUser.role.name) userRoleNames.add(currentUser.role.name);
        }
      }

      if (Array.isArray(currentUser.roles)) {
        currentUser.roles.forEach((r) => {
          if (typeof r === "string") {
            userRoleIds.add(r);
          } else if (typeof r === "object") {
            if (r._id) userRoleIds.add(String(r._id));
            if (r.name) userRoleNames.add(r.name);
          }
        });
      }
    }

    // 3. STRICT FILTERING: SHOW ONLY ITEMS EXPLICITLY PERMITTED TO USER'S ROLE
    const filteredSidebar = flatSidebar.filter((item) => {
      // Admin / Owner sees full sidebar
      if (isAdminOrOwner) return true;

      const itemRoles = Array.isArray(item.roles) ? item.roles : [];

      // If sidebar item has no roles assigned at all, hide from non-admins
      if (itemRoles.length === 0) return false;

      // Extract all role IDs and Names assigned to this sidebar item
      const itemRoleIds = new Set();
      const itemRoleNames = new Set();

      itemRoles.forEach((r) => {
        if (!r) return;
        if (typeof r === "string") {
          itemRoleIds.add(r);
        } else if (typeof r === "object") {
          if (r._id) itemRoleIds.add(String(r._id));
          if (r.name) itemRoleNames.add(r.name);
        }
      });

      // Check if user has a matching role ID
      for (const userRoleId of userRoleIds) {
        if (itemRoleIds.has(userRoleId)) return true;
      }

      // Check if user has a matching role Name
      for (const userRoleName of userRoleNames) {
        if (itemRoleNames.has(userRoleName)) return true;
      }

      // If user's role is not explicitly listed in item.roles, HIDE
      return false;
    });

    // 4. BUILD NESTED TREE STRUCTURE
    const itemMap = Object.create(null);
    const treeRoots = [];

    filteredSidebar.forEach((item) => {
      itemMap[item._id.toString()] = {
        ...item,
        children: [],
      };
    });

    filteredSidebar.forEach((item) => {
      const mappedItem = itemMap[item._id.toString()];

      if (item.parentId) {
        const parentIdStr = item.parentId._id
          ? item.parentId._id.toString()
          : item.parentId.toString();

        if (itemMap[parentIdStr]) {
          itemMap[parentIdStr].children.push(mappedItem);
        }
      } else {
        treeRoots.push(mappedItem);
      }
    });

    // Re-sort children at each level by itemOrder
    const sortTree = (nodes) => {
      nodes.sort((a, b) => (a.itemOrder || 0) - (b.itemOrder || 0));
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortTree(node.children);
        }
      });
    };

    sortTree(treeRoots);

    return reply.code(200).send({
      success: true,
      result: treeRoots,
      message: "Website sidebar tree retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error in getSidebar:", error);

    return reply.code(500).send({
      success: false,
      result: null,
      message: "An error occurred while retrieving website sidebar tree",
      error: error.message,
    });
  }
};

module.exports = { getSidebar };
