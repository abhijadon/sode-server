"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const establishedYearSchema = new Schema(
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
    year: {
      type: String,
      required: [true, "Established year is required"],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: null,
    },
    slug: {
      type: String,
      required: [true, "Established year slug is required"],
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

establishedYearSchema.index({ removed: 1, enabled: 1 });
establishedYearSchema.index({ slug: 1, removed: 1 });

const EstablishedYear = mongoose.model("EstablishedYear", establishedYearSchema);

module.exports = { EstablishedYear };
