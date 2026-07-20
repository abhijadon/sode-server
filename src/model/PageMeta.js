"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const pageMetaSchema = new Schema(
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
    pageName: {
      type: String,
      required: [true, "Page name is required"],
      trim: true,
    },
    pagePath: {
      type: String,
      required: [true, "Page path or route URL is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Meta Title tag is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Meta Description tag is required"],
      trim: true,
    },
    keywords: {
      type: String,
      default: null,
      trim: true,
    },
    canonicalUrl: {
      type: String,
      default: null,
      trim: true,
    },
    ogTitle: {
      type: String,
      default: null,
      trim: true,
    },
    ogDescription: {
      type: String,
      default: null,
      trim: true,
    },
    ogImage: {
      type: String,
      default: null,
      trim: true,
    },
    twitterCard: {
      type: String,
      default: "summary_large_image",
      trim: true,
    },
    createdBy: {
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

// Indexes for fast searching and route lookup
pageMetaSchema.index({ pagePath: 1, removed: 1, enabled: 1 });

const PageMeta = mongoose.model("PageMeta", pageMetaSchema);

module.exports = { PageMeta };
