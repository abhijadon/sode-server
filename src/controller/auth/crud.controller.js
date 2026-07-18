"use strict";

const { User } = require("../../model/user");
const { Role } = require("../../model/role");
const { Workspace } = require("../../model/workspace");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * 1. CREATE USER (Registration)
 */
const create = async (request, reply) => {
  try {
    const {
      enabled,
      fullname,
      username,
      email,
      password,
      phone,
      isAdmin,
      isSubadmin,
      isOwner,
      role: roleId, // स्कीमा के अनुसार 'role'
      workspace: workspaceIds, // स्कीma के अनुसार 'workspace' ऐरे
      reportsTo,
      photo,
    } = request.body;

    // A. सिंगल एडमिन चेक
    if (isAdmin) {
      const adminExist = await User.findOne({ isAdmin: true, removed: false });
      if (adminExist) {
        return reply.code(400).send({
          success: false,
          message:
            "An admin user already exists. Only one admin can be created.",
        });
      }
    }

    // B. ईमेल, फोन, या यूजरनेम की विशिष्टता (Uniqueness) चेक करना
    const userExist = await User.findOne({
      $or: [{ email }, { phone }, { username }],
      removed: false,
    });

    if (userExist) {
      let errorMessage = "User already exists with ";
      if (userExist.email === email) errorMessage += `email: ${email}`;
      else if (userExist.phone === phone) errorMessage += `phone: ${phone}`;
      else if (userExist.username === username)
        errorMessage += `username: ${username}`;

      return reply.code(400).send({
        success: false,
        message: errorMessage,
      });
    }

    // C. रोल वैलिडेशन (Role Validation)
    const roleData = await Role.findById(roleId);
    if (!roleData) {
      return reply.code(400).send({
        success: false,
        message: "Assigned role does not exist.",
      });
    }

    // D. वर्कस्पेस ऐरे वैलिडेशन
    const validWorkspaceIds = Array.isArray(workspaceIds)
      ? workspaceIds
      : [workspaceIds].filter(Boolean);
    if (validWorkspaceIds.length > 0) {
      const workspaces = await Workspace.find({
        _id: { $in: validWorkspaceIds },
      });
      if (workspaces.length !== validWorkspaceIds.length) {
        return reply.code(400).send({
          success: false,
          message: "One or more workspaces are invalid.",
        });
      }
    }

    // E. रिपोर्टिंग मैनेजर (Reporting To) वैलिडेशन
    let reportsToUser = null;
    if (reportsTo) {
      reportsToUser = await User.findOne({ _id: reportsTo, removed: false });
      if (!reportsToUser) {
        return reply.code(400).send({
          success: false,
          message: "Reporting user (reportsTo) does not exist.",
        });
      }
    }

    // F. पासवर्ड हैशिंग
    const hashPassword = await bcrypt.hash(password, 10);

    // G. नया यूजर सेव करना
    const user = new User({
      enabled,
      fullname,
      username,
      email,
      password: hashPassword,
      phone,
      isAdmin,
      isSubadmin,
      isOwner,
      role: roleId,
      workspace: validWorkspaceIds,
      reportsTo: reportsToUser ? reportsToUser._id : null,
      photo,
    });

    const result = await user.save();

    // Redis कैशे क्लियरिंग (यदि उपयोग हो रहा है)
    if (
      request.server.redis &&
      typeof request.server.redis.clearCache === "function"
    ) {
      await request.server.redis.clearCache("user_list");
    }

    // रिस्पॉन्स से पासवर्ड हटाना
    const userResponse = result.toObject();
    delete userResponse.password;

    return reply.code(201).send({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (err) {
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

/**
 * 2. UPDATE USER
 */
const update = async (request, reply) => {
  try {
    const { id } = request.params;
    const updateData = { ...request.body };

    // यदि पासवर्ड अपडेट हो रहा है तो उसे दोबारा हैश करें
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: id, removed: false },
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return reply.code(404).send({
        success: false,
        message: "User not found or already removed.",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

/**
 * 3. SOFT DELETE USER
 */
const remove = async (request, reply) => {
  try {
    const { id } = request.params;

    const deletedUser = await User.findOneAndUpdate(
      { _id: id, removed: false },
      { $set: { removed: true, enabled: false } },
      { new: true },
    );

    if (!deletedUser) {
      return reply.code(404).send({
        success: false,
        message: "User not found or already deleted.",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

module.exports = { create, update, remove };
