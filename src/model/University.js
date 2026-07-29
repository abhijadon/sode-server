"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const universitySchema = new Schema(
  {
    removed: {
      type: Boolean,
      default: false,
    },
    removedAt: {
      type: Date,
      default: null,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    workspaceId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Workspace",
        index: true,
      },
    ],

    // Basic Identification
    name: {
      type: String,
      required: [true, "University name is required"],
      trim: true,
      index: true,
    },
    shortName: {
      type: String,
      trim: true,
      default: null,
    },
    slug: {
      type: String,
      required: [true, "University slug is required"],
      unique: true, // Automatically creates a unique index
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: null,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // Media & Branding Assets
    logoSrc: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },
    imageSrc: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },
    brochureUrl: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },

    // Location & Contact
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      default: null,
      index: true,
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "State",
      default: null,
    },
    country: {
      type: Schema.Types.ObjectId,
      ref: "Country",
      default: null,
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: null,
    },

    // Accreditations & Ratings (ObjectId References)
    approvals: [
      {
        type: Schema.Types.ObjectId,
        ref: "Approval",
      },
    ],
    naacRating: {
      type: Schema.Types.ObjectId,
      ref: "NaacRating",
      default: null,
    },
    nirfRank: {
      type: Schema.Types.ObjectId,
      ref: "NirfRank",
      default: null,
    },
    ratingRef: {
      type: Schema.Types.ObjectId,
      ref: "Rating",
      default: null,
    },

    // Course & Admission Details
    established: {
      type: Schema.Types.ObjectId,
      ref: "EstablishedYear",
      default: null,
    },
    examMode: {
      type: Schema.Types.ObjectId,
      ref: "ExamMode",
      default: null,
    },
    learningMode: {
      type: Schema.Types.ObjectId,
      ref: "LearningMode",
      default: null,
    },
    lmsAccess: {
      type: String,
      trim: true,
      default: "24/7 LMS Portal & Live Interactive Sessions",
    },
    emiStarts: {
      type: String,
      trim: true,
      default: null,
    },
    feeRange: {
      type: Schema.Types.ObjectId,
      ref: "Fee",
      default: null,
    },

    // Rich Overview & Content Reference
    contentRef: [
      {
        type: Schema.Types.ObjectId,
        ref: "Content",
      },
    ],

    // Display & Meta
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

// Compound Indexes (Covering queries on slug/removed and removed/enabled)
universitySchema.index({ slug: 1, removed: 1 });
universitySchema.index({ removed: 1, enabled: 1 });

const University = mongoose.model("University", universitySchema);

module.exports = { University };