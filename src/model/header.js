"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Main Dynamic Header Schema (Supports Infinite nesting via parentId & Multi-Library Icons)
 */
const headerSchema = new Schema(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Header",
      default: null, // यदि null है, तो यह मुख्य (Parent) मेन्यू है।
      index: true,
    },

    removed: {
      type: Boolean,
      default: false,
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    label: {
      type: String,
      required: [true, "Menu label is required"],
      trim: true,
      maxlength: [100, "Menu label cannot exceed 100 characters"],
    },

    href: {
      type: String,
      required: [true, "Menu href is required"],
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },

    premium: {
      type: Boolean,
      default: false,
    },

    text: {
      type: String,
      trim: true,
      default: null,
    },

    color: {
      type: String,
      trim: true,
      default: null,
    },

    bgColor: {
      type: String,
      trim: true,
      default: null,
    },

    textColor: {
      type: String,
      trim: true,
      default: null,
    },

    // 🔥 ADVANCED ICON SYSTEM INTEGRATION
    icon: {
      name: {
        type: String,
        trim: true,
        default: null,
      },
      library: {
        type: String,
        enum: [
          "fa",
          "react-fa",
          "md",
          "ai",
          "bi",
          "fi",
          "hi",
          "ri",
          "gi",
          "lucide",
        ],
        default: "lucide",
      },
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },

    openInNewTab: {
      type: Boolean,
      default: false,
    },

    showOnDesktop: {
      type: Boolean,
      default: true,
    },

    showOnMobile: {
      type: Boolean,
      default: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * ==========================================
 * ADVANCED INDEXES FOR ULTRA-FAST LOADING
 * ==========================================
 */

// 1. फ्रंटएंड पर पैरेंट मेन्यू को फ़ास्ट लोड और सॉर्ट करने के लिए
headerSchema.index({ parentId: 1, removed: 1, enabled: 1, order: 1 });

// 2. मोबाइल/डेस्कटॉप रिस्पॉन्सिव फ़िल्टर के लिए
headerSchema.index({
  parentId: 1,
  removed: 1,
  enabled: 1,
  showOnDesktop: 1,
  showOnMobile: 1,
  order: 1,
});

// 3. सिंगल स्लग और यूजर स्पेसिफिक एडमिन पैनल्स के लिए
headerSchema.index({ slug: 1 }, { sparse: true });
headerSchema.index({ userId: 1 }, { sparse: true });

const Header = mongoose.model("Header", headerSchema);

module.exports = { Header };
