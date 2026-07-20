"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const mediaSchema = new Schema(
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
      required: [true, "Media name is required"],
      trim: true,
    },
    alt: {
      type: String,
      default: "",
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Public URL is required"],
      trim: true,
    },
    bucket: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
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

mediaSchema.index({ removed: 1, enabled: 1 });
mediaSchema.index({ name: "text", alt: "text" });

const Media = mongoose.model("Media", mediaSchema);

module.exports = { Media };
