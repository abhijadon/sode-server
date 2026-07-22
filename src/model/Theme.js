"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const themeSchema = new Schema(
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
    themeName: {
      type: String,
      required: [true, "Theme name is required"],
      trim: true,
    },
    themeMode: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "dark",
    },
    
    // ── Primary Colors ──
    primaryColor: { type: String, default: "#102441", trim: true },
    secondaryColor: { type: String, default: "#EEC471", trim: true },
    accentColor: { type: String, default: "#3b82f6", trim: true },
    backgroundColor: { type: String, default: "#ffffff", trim: true },
    textColor: { type: String, default: "#0f172a", trim: true },

    // ── Advanced Gradients ──
    useGradient: { type: Boolean, default: true },
    gradientStart: { type: String, default: "#102441", trim: true },
    gradientEnd: { type: String, default: "#0a1424", trim: true },
    gradientDirection: {
      type: String,
      enum: ["to-r", "to-l", "to-t", "to-b", "to-tr", "to-br"],
      default: "to-b",
    },

    // ── Button Aesthetics ──
    buttonBgColor: { type: String, default: "#EEC471", trim: true },
    buttonTextColor: { type: String, default: "#102441", trim: true },
    buttonHoverBgColor: { type: String, default: "#f7d594", trim: true },
    buttonBorderRadius: {
      type: String,
      enum: ["none", "sm", "md", "lg", "xl", "full"],
      default: "full",
    },

    // ── Card Styling ──
    cardBgColor: { type: String, default: "#162a4d", trim: true },
    cardBorderColor: { type: String, default: "#1e3b6c", trim: true },
    cardShadow: {
      type: String,
      enum: ["none", "sm", "md", "lg", "xl", "2xl"],
      default: "lg",
    },

    // ── Header/Navigation Style ──
    headerBgColor: { type: String, default: "#102441", trim: true },
    headerTextColor: { type: String, default: "#ffffff", trim: true },
    headerSticky: { type: Boolean, default: true },
    headerFont: { type: String, default: "Inter", trim: true },
    logoWidth: { type: Number, default: 120 },
    logoHeight: { type: Number, default: 40 },

    // ── Layout & Typography ──
    maxContainerWidth: {
      type: String,
      enum: ["1200px", "1440px", "1600px", "100%"],
      default: "1440px",
    },
    headingFont: { type: String, default: "Outfit", trim: true },
    bodyFont: { type: String, default: "Inter", trim: true },
    borderRadius: {
      type: String,
      enum: ["none", "sm", "md", "lg", "xl", "full"],
      default: "lg",
    },

    // ── Interactive Polish ──
    glassmorphism: { type: Boolean, default: true },
    transitionSpeed: {
      type: String,
      enum: ["fast", "normal", "slow"],
      default: "normal",
    },
    enableAnimations: { type: Boolean, default: true },

    customCss: {
      type: String,
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
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

themeSchema.index({ isDefault: 1, removed: 1 });

const Theme = mongoose.model("Theme", themeSchema);

module.exports = { Theme };
