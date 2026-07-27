"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const apiConfigSchema = new Schema(
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
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    baseUrl: {
      type: String,
      default: "",
      trim: true,
    },
    endpoint: {
      type: String,
      default: "",
      trim: true,
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      default: "POST",
      uppercase: true,
    },
    version: {
      type: String,
      default: "v1",
      trim: true,
    },
    triggerEvent: {
      type: String,
      default: "lead_submission",
      trim: true,
    },
    headers: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    bodyParams: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    requestBody: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timeout: {
      type: Number,
      default: 10000,
    },
    retryCount: {
      type: Number,
      default: 3,
    },
    rateLimit: {
      maxRequests: {
        type: Number,
        default: 100,
      },
      windowMs: {
        type: Number,
        default: 60000,
      },
    },
    authType: {
      type: String,
      enum: ["none", "bearer", "basic", "apiKey", "custom"],
      default: "none",
    },
    apiKey: {
      type: String,
      default: null,
      trim: true,
    },
    apiSecret: {
      type: String,
      default: null,
      trim: true,
    },
    cacheTtl: {
      type: Number,
      default: 300,
    },
    environment: {
      type: String,
      enum: ["development", "staging", "production"],
      default: "production",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
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

apiConfigSchema.index({ key: 1, removed: 1, enabled: 1 });

const ApiConfig = mongoose.model("ApiConfig", apiConfigSchema);

module.exports = { ApiConfig };
