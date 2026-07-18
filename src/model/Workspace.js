const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    removed: {
      type: Boolean,
      default: false,
      index: true,
    },

    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      trim: true,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

workspaceSchema.index(
  {
    tenantId: 1,
    name: 1,
  },
  {
    unique: true,
  },
);

const Workspace = mongoose.model("Workspace", workspaceSchema);

module.exports = { Workspace };
