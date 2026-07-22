"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

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
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Course slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      default: null,
      index: true,
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
        index: true,
      },
    ],
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
    fee: {
      type: Schema.Types.ObjectId,
      ref: "Fee",
      default: null,
      index: true,
    },
    brochureUrl: {
      type: String,
      default: null,
      trim: true,
    },
    syllabus: [
      {
        type: String,
        trim: true,
      },
    ],
    careers: {
      type: String,
      default: null,
      trim: true,
    },
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

courseSchema.index({ university: 1, removed: 1, enabled: 1 });
courseSchema.index({ category: 1, removed: 1, enabled: 1 });
courseSchema.index({ categories: 1, removed: 1, enabled: 1 });
courseSchema.index({ slug: 1, removed: 1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = { Course };
