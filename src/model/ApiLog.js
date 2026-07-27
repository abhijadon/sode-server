"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const apiLogSchema = new Schema(
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
    apiConfig: {
      type: Schema.Types.ObjectId,
      ref: "ApiConfig",
      default: null,
      index: true,
    },
    configKey: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      default: "GET",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending", "timeout"],
      default: "pending",
      index: true,
    },
    statusCode: {
      type: Number,
      default: null,
      index: true,
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
    requestHeaders: {
      type: Schema.Types.Mixed,
      default: {},
    },
    requestParams: {
      type: Schema.Types.Mixed,
      default: {},
    },
    requestBody: {
      type: Schema.Types.Mixed,
      default: {},
    },
    responseBody: {
      type: Schema.Types.Mixed,
      default: {},
    },
    errorMessage: {
      type: String,
      default: null,
      trim: true,
    },
    errorStack: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },
    userAgent: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

apiLogSchema.index({ apiConfig: 1, status: 1, createdAt: -1 });
apiLogSchema.index({ configKey: 1, statusCode: 1, createdAt: -1 });
apiLogSchema.index({ createdAt: -1 });

const ApiLog = mongoose.model("ApiLog", apiLogSchema);

module.exports = { ApiLog };
