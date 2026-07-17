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
    action: {
      type: [String],
      default: ["read"],
      enum: ["create", "read", "update", "delete", "write"],
    },
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
