"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const partnerCourseSchema = new Schema(
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
      required: [true, "Course reference is required"],
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
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

partnerCourseSchema.index({ course: 1, removed: 1, enabled: 1 });

const PartnerCourse = mongoose.model("PartnerCourse", partnerCourseSchema);

module.exports = { PartnerCourse };
