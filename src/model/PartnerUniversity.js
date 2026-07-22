"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const partnerUniversitySchema = new Schema(
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
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: [true, "Base university reference is required"],
      index: true,
    },
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
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
    location: {
      type: String,
      default: "India / Global",
      trim: true,
    },
    established: {
      type: String,
      default: "2000",
      trim: true,
    },
    type: {
      type: String,
      enum: ["Global", "State Private", "Deemed", "Central", "Open University", "Autonomous"],
      default: "Global",
      trim: true,
      index: true,
    },
    approvals: [
      {
        type: String,
        trim: true,
      },
    ],
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 250,
    },
    examMode: {
      type: String,
      default: "100% Online / Assignment-Based",
      trim: true,
    },
    emiStarts: {
      type: String,
      default: "₹4,999/month",
      trim: true,
    },
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

partnerUniversitySchema.index({ removed: 1, enabled: 1 });

const PartnerUniversity = mongoose.model("PartnerUniversity", partnerUniversitySchema);

module.exports = { PartnerUniversity };
