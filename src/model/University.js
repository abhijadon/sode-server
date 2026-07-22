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
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
      index: true,
    },
    imageSrc: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

universitySchema.index({ slug: 1, removed: 1 });
universitySchema.index({ removed: 1, enabled: 1 });

const University = mongoose.model("University", universitySchema);

module.exports = { University };
