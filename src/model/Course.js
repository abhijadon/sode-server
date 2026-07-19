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
    category: {
      type: String,
      required: [true, "Course category is required"],
      enum: {
        values: ["doctorate", "certification", "executive", "master"],
        message: "{VALUE} is not a valid category",
      },
      lowercase: true,
      trim: true,
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
      type: String,
      required: [true, "University name is required"],
      trim: true,
      index: true,
    },
    image: {
      type: String,
      required: [true, "Course image path is required"],
      trim: true,
    },
    logo: {
      type: String,
      required: [true, "University logo path is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Course duration is required"],
      trim: true,
    },
    eligibility: {
      type: String,
      required: [true, "Eligibility criteria is required"],
      trim: true,
    },
    brochureUrl: {
      type: String,
      default: null,
      trim: true,
    },
    fee: {
      type: Number,
      default: 0,
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

// Indexes for fast searching and filtering
courseSchema.index({ category: 1, removed: 1, enabled: 1 });
courseSchema.index({ slug: 1, removed: 1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = { Course };
