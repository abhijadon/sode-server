"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const pageSchema = new Schema(
  {
    removed: {
      type: Boolean,
      default: false,
      index: true,
    },
    removedAt: {
      type: Date,
      default: null,
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Page title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Page URL slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    pageType: {
      type: String,
      enum: ["general", "course", "university", "blog"],
      default: "general",
      index: true,
    },

    // ── Dynamic Associations ──
    associatedCourse: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      default: null,
      index: true,
    },
    associatedUniversity: {
      type: Schema.Types.ObjectId,
      ref: "University",
      default: null,
      index: true,
    },

    // ── Dynamic Sections (WordPress Style Blocks) ──
    sections: [
      {
        sectionType: {
          type: String,
          enum: ["hero", "stats", "features", "faqs", "reviews", "rich_text", "custom_html"],
          required: true,
        },
        sectionTitle: {
          type: String,
          default: null,
          trim: true,
        },
        sectionSubtitle: {
          type: String,
          default: null,
          trim: true,
        },
        bodyContent: {
          type: String,
          default: null,
          trim: true,
        },
        order: {
          type: Number,
          default: 0,
        },
      }
    ],

    // ── SEO Configs ──
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    metaKeywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

pageSchema.index({ slug: 1, removed: 1 });

const Page = mongoose.model("Page", pageSchema);

module.exports = { Page };
