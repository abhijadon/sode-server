const mongoose = require("mongoose");

const sidebarSchema = new mongoose.Schema(
  {
    removed: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    section: {
      type: String,
      required: true,
    },

    sectionOrder: {
      type: Number,
      default: 0,
      index: true,
    },

    itemOrder: {
      type: Number,
      default: 0,
      index: true,
    },

    // 🔥 ICON SYSTEM
    icon: {
      name: {
        type: String,
        required: true,
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

    path: {
      type: String,
      default: null,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sidebar",
      default: null,
    },

    target: {
      type: String,
      default: "_self",
    },

    newTab: {
      type: Boolean,
      default: false,
    },

    badge: {
      value: String,
      color: String,
    },

    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Sidebar = mongoose.model("Sidebar", sidebarSchema);
module.exports = { Sidebar };
