"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const ratingSchema = new Schema(
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

    // ── References
    // ── Rating & Review ───────────────────────────────────
    rating: {
      type: Number,
      required: [true, "Rating value is required"],
      min: [0.5, "Rating must be at least 0.5"],
      max: [5, "Rating must be at most 5"],
      // Allows: 0.5, 1.0, 1.5, 2.0 ... 5.0  (half-star steps)
      validate: {
        validator: function (v) {
          // Must be a multiple of 0.5
          return Number.isFinite(v) && v * 2 === Math.round(v * 2);
        },
        message: (props) =>
          `${props.value} is not valid. Rating must be in 0.5 steps (e.g. 1.0, 1.5, 2.5, 4.5)`,
      },
    },
    review: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters"],
      maxlength: [2000, "Review cannot exceed 2000 characters"],
    },
    title: {
      type: String,
      default: null,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    // ── Moderation ────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },

    // ── Engagement ────────────────────────────────────────
    helpfulCount: {
      type: Number,
      default: 0,
    },

    // ── Metadata ─────────────────────────────────────────
    isVerifiedPurchase: {
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

// ── Indexes ──────────────────────────────────────────────────────────────────
ratingSchema.index({ status: 1, removed: 1 });
ratingSchema.index({ rating: 1 });

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = { Rating };