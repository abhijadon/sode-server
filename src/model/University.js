"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const universitySchema = new Schema(
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
      required: [true, "University name is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "University slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logoSrc: {
      type: String,
      required: [true, "Logo path is required"],
      trim: true,
    },
    imageSrc: {
      type: String,
      required: [true, "Campus image path is required"],
      trim: true,
    },
    courses: [
      {
        type: String,
        trim: true,
      },
    ],
    brochureUrl: {
      type: String,
      default: null,
      trim: true,
    },
    paragraphs: [
      {
        type: String,
        trim: true,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
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

// High performance indexes
universitySchema.index({ slug: 1, removed: 1 });
universitySchema.index({ removed: 1, enabled: 1 });

const University = mongoose.model("University", universitySchema);

module.exports = { University };
