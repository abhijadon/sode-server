const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    removed: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: null,
      trim: true,
    },

    // Global default permissions (applies when no workspace-specific entry matches)
    action: {
      type: [String],
      enum: ["create", "read", "update", "delete", "write"],
      default: ["read"],
    },

    // Per-workspace permissions — har workspace ki apni alag action list hogi
    workspace: [
      {
        workspaceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Workspace",
          required: true,
        },
        action: {
          type: [
            {
              type: String,
              enum: ["create", "read", "update", "delete", "write"],
            },
          ],
          default: ["read"],
        },
        _id: false, // Embedded sub-doc — alag _id ki zaroorat nahi
      },
    ],

    des: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

const Role = mongoose.model("Role", roleSchema);
module.exports = { Role };
