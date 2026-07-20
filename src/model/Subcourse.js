"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const subcourseSchema = new Schema(
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
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Parent course reference is required"],
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Subcourse title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Subcourse slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      default: null,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    duration: {
      type: Schema.Types.ObjectId,
      ref: "Duration",
      default: null,
      index: true,
    },
    eligibility: {
      type: Schema.Types.ObjectId,
      ref: "Eligibility",
      default: null,
      index: true,
    },
    fee: {
      type: Schema.Types.ObjectId,
      ref: "Fee",
      default: null,
      index: true,
    },
    image: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
      index: true,
    },
    brochureUrl: {
      type: String,
      default: null,
      trim: true,
    },
    modules: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    featured: {
      type: Boolean,
      default: false,
      index: true,
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

// High-performance compound indexes
subcourseSchema.index({ course: 1, removed: 1, enabled: 1 });
subcourseSchema.index({ slug: 1, removed: 1 });

const Subcourse = mongoose.model("Subcourse", subcourseSchema);

module.exports = { Subcourse };
