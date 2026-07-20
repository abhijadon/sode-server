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

partnerUniversitySchema.index({ removed: 1, enabled: 1 });

const PartnerUniversity = mongoose.model("PartnerUniversity", partnerUniversitySchema);

module.exports = { PartnerUniversity };
