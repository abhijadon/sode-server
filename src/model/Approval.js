"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const approvalSchema = new Schema(
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
    name: {
      type: String,
      required: [true, "Approval name is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Approval slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logoSrc: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
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

approvalSchema.index({ removed: 1, enabled: 1 });
approvalSchema.index({ slug: 1, removed: 1 });

const Approval = mongoose.model("Approval", approvalSchema);

module.exports = { Approval };
