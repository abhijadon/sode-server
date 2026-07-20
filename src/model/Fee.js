"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const feeSchema = new Schema(
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
    amount: {
      type: Number,
      default: 0,
      required: [true, "Fee amount is required"],
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Fee display title is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Fee slug is required"],
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

feeSchema.index({ slug: 1, removed: 1 });
feeSchema.index({ removed: 1, enabled: 1 });

const Fee = mongoose.model("Fee", feeSchema);

module.exports = { Fee };
