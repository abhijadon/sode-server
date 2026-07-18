"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    removed: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isSubadmin: {
      type: Boolean,
      default: false,
    },
    isOwner: {
      type: Boolean,
      default: false,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role assignment is required"],
    },
    workspace: [
      {
        type: Schema.Types.ObjectId,
        ref: "Workspace",
      },
    ],
    reportsTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    photo: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// फ़ास्ट सर्च के लिए इंडेक्सिंग
userSchema.index({ email: 1, phone: 1, username: 1 });
userSchema.index({ workspace: 1 });

const User = mongoose.model("User", userSchema);
module.exports = { User };
