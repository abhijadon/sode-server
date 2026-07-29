"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const naacRatingSchema = new Schema(
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
    grade: {
      type: String,
      required: [true, "NAAC Grade is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "NAAC Grade slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    score: {
      type: String,
      default: null,
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

naacRatingSchema.index({ removed: 1, enabled: 1 });
naacRatingSchema.index({ slug: 1, removed: 1 });

const NaacRating = mongoose.model("NaacRating", naacRatingSchema);

module.exports = { NaacRating };
