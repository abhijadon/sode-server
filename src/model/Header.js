"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Main Dynamic Header Schema (Supports Infinite nesting via parentId & Multi-Library Icons)
 */
const headerSchema = new Schema(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Header",
      default: null,
      index: true,
    },

    removed: {
      type: Boolean,
      default: false,
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    label: {
      type: String,
      required: [true, "Menu label is required"],
      trim: true,
      maxlength: [100, "Menu label cannot exceed 100 characters"],
    },

    href: {
      type: String,
      required: [true, "Menu href is required"],
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },

    premium: {
      type: Boolean,
      default: false,
    },

    text: {
      type: String,
      trim: true,
      default: null,
    },

    color: {
      type: String,
      trim: true,
      default: null,
    },

    bgColor: {
      type: String,
      trim: true,
      default: null,
    },

    textColor: {
      type: String,
      trim: true,
      default: null,
    },

    icon: {
      name: {
        type: String,
        trim: true,
        default: null,
      },
      library: {
        type: String,
        enum: [
          "fa",
          "react-fa",
          "md",
          "ai",
          "bi",
          "fi",
          "hi",
          "ri",
          "gi",
          "lucide",
        ],
        default: "lucide",
      },
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },

    openInNewTab: {
      type: Boolean,
      default: false,
    },

    showOnDesktop: {
      type: Boolean,
      default: true,
    },

    showOnMobile: {
      type: Boolean,
      default: true,
    },

    // Logo & Course/University/Media Linkage (Pure ObjectId References to Media Collection)
    mediaId: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },

    logoSrc: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },

    showLogo: {
      type: Boolean,
      default: true,
    },

    relatedCourse: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    relatedUniversity: {
      type: Schema.Types.ObjectId,
      ref: "University",
      default: null,
    },

    badge: {
      type: String,
      trim: true,
      default: null,
    },

    badgeColor: {
      type: String,
      trim: true,
      default: "gold",
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

headerSchema.index({ parentId: 1, removed: 1, enabled: 1 });
headerSchema.index({ slug: 1, removed: 1 });

const Header = mongoose.models.Header || mongoose.model("Header", headerSchema);
module.exports = Header;
