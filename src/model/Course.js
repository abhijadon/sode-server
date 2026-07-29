"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const subcourseItemSchema = new Schema(
  {
    subcourse: {
      type: Schema.Types.ObjectId,
      ref: "Subcourse",
      default: null,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fee: {
      type: Schema.Types.ObjectId,
      ref: "Fee",
      default: null,
    },
    duration: {
      type: Schema.Types.ObjectId,
      ref: "Duration",
      default: null,
    },
    eligibility: {
      type: Schema.Types.ObjectId,
      ref: "Eligibility",
      default: null,
    },
    modules: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    keyHighlights: [
      { type: String, trim: true },
    ],
    whoCanApply: [
      { type: String, trim: true },
    ],
    admissionProcess: [
      { type: String, trim: true },
    ],
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const universityOfferingSchema = new Schema(
  {
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: [true, "University is required for offering"],
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
      index: true,
    },
    fee: {
      type: Schema.Types.ObjectId,
      ref: "Fee",
      default: null,
      index: true,
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
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        index: true,
      },
    ],
    subcourses: [subcourseItemSchema],
    brochureUrl: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const courseSchema = new Schema(
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
    // Identification
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Course slug is required"],
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
    // Master Categories
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        index: true,
      },
    ],
    // 🌟 University-Wise Specific Offerings
    universityOfferings: [universityOfferingSchema],

    // Media & Branding
    logo: {
      type: Schema.Types.ObjectId,
      ref: "Media",
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
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },

    // Display & Meta
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

courseSchema.index({ categories: 1, removed: 1, enabled: 1 });
courseSchema.index({ "universityOfferings.university": 1, removed: 1, enabled: 1 });
courseSchema.index({ slug: 1, removed: 1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = { Course };
