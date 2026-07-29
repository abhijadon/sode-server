"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const nirfRankSchema = new Schema(
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
      required: [true, "NIRF Rank title is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "NIRF Rank slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    rankNumber: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      default: "University",
      trim: true,
    },
    year: {
      type: String,
      default: "2025",
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
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

nirfRankSchema.index({ removed: 1, enabled: 1 });
nirfRankSchema.index({ slug: 1, removed: 1 });

const NirfRank = mongoose.model("NirfRank", nirfRankSchema);

module.exports = { NirfRank };
