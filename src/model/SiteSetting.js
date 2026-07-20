"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const siteSettingSchema = new Schema(
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
    settingKey: {
      type: String,
      default: "default_site_setting",
      unique: true,
      trim: true,
    },
    siteName: {
      type: String,
      default: "SODE",
      trim: true,
    },
    siteUrl: {
      type: String,
      default: "https://sode.co.in",
      trim: true,
    },
    gtmId: {
      type: String,
      default: "GTM-567GP8S9",
      trim: true,
    },
    googleAdsIds: [
      {
        type: String,
        trim: true,
      },
    ],
    faviconIco: {
      type: String,
      default: "/assets/images/favicon.ico",
      trim: true,
    },
    faviconSvg: {
      type: String,
      default: "/assets/images/favicon.svg",
      trim: true,
    },
    favicon96: {
      type: String,
      default: "/assets/images/favicon-96x96.png",
      trim: true,
    },
    appleTouchIcon: {
      type: String,
      default: "/assets/images/apple-touch-icon.png",
      trim: true,
    },
    webmanifest: {
      type: String,
      default: "/assets/images/site.webmanifest",
      trim: true,
    },
    ogImage: {
      type: String,
      default: "https://sode.co.in/assets/images/sode-homepage-og-card-image.png",
      trim: true,
    },
    showGlobalCta: {
      type: Boolean,
      default: true,
    },
    headerScript: {
      type: String,
      default: null,
    },
    footerScript: {
      type: String,
      default: null,
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

const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);

module.exports = { SiteSetting };
