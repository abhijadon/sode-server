"use strict";

const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
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
      required: true,
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    logo: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: null,
    },

    website: {
      type: String,
      default: null,
      trim: true,
    },

    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    address: {
      type: String,
      default: null,
    },

    city: {
      type: String,
      default: null,
      trim: true,
    },

    state: {
      type: String,
      default: null,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    pincode: {
      type: String,
      default: null,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

tenantSchema.index({
  removed: 1,
  enabled: 1,
});

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = { Tenant };
