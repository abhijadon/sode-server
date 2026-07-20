"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const durationSchema = new Schema(
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
      required: [true, "Duration title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Duration slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    months: {
      type: Number,
      required: [true, "Number of months is required"],
      default: 12,
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

durationSchema.index({ removed: 1, enabled: 1 });
durationSchema.index({ slug: 1, removed: 1 });
durationSchema.index({ months: 1, removed: 1 });

const Duration = mongoose.model("Duration", durationSchema);

module.exports = { Duration };
