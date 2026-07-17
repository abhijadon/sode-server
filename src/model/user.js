const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = { User };
