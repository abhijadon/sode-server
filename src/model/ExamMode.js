"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const examModeSchema = new Schema(
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
      required: [true, "Exam Mode name is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Exam Mode slug is required"],
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

examModeSchema.index({ removed: 1, enabled: 1 });
examModeSchema.index({ slug: 1, removed: 1 });

const ExamMode = mongoose.model("ExamMode", examModeSchema);

module.exports = { ExamMode };
