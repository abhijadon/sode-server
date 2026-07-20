"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const eligibilitySchema = new Schema(
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
      required: [true, "Eligibility title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Eligibility slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
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

eligibilitySchema.index({ removed: 1, enabled: 1 });
eligibilitySchema.index({ slug: 1, removed: 1 });

const Eligibility = mongoose.model("Eligibility", eligibilitySchema);

module.exports = { Eligibility };
