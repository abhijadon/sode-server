"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const slideSchema = new Schema(
    {
        title: {
            type: String,
            trim: true,
            default: "",
        },
        subtitle: {
            type: String,
            trim: true,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        badge: {
            type: String,
            trim: true,
            default: "", // e.g. "NEW ADMISSIONS OPEN", "50% OFF"
        },
        // Media References (Uploaded via Media Manager / MinIO)
        image: {
            type: Schema.Types.ObjectId,
            ref: "Media",
            default: null,
        },
        bgImage: {
            type: Schema.Types.ObjectId,
            ref: "Media",
            default: null,
        },
        mobileImage: {
            type: Schema.Types.ObjectId,
            ref: "Media",
            default: null,
        },
        // Primary CTA Button
        primaryCtaText: {
            type: String,
            trim: true,
            default: "",
        },
        primaryCtaLink: {
            type: String,
            trim: true,
            default: "",
        },
        // Secondary CTA Button
        secondaryCtaText: {
            type: String,
            trim: true,
            default: "",
        },
        secondaryCtaLink: {
            type: String,
            trim: true,
            default: "",
        },
        // Optional Stats / Highlights (e.g., [{ label: "Students Enrolled", value: "50k+" }])
        stats: [
            {
                label: { type: String, trim: true },
                value: { type: String, trim: true },
            },
        ],
        order: {
            type: Number,
            default: 0,
        },
        enabled: {
            type: Boolean,
            default: true,
        },
    },
    { _id: true, timestamps: false }
);

const heroSchema = new Schema(
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

        // ── Form Visibility Config ──────────────────────────────
        showForm: {
            type: String,
            enum: ["both", "desktop", "mobile", "none"],
            default: "both",
        },

        // ── Target Placement / Page ────────────────────────────
        name: {
            type: String,
            required: [true, "Hero section identifier name is required"],
            trim: true,
        },
        page: {
            type: String,
            required: [true, "Target page slug is required"],
            trim: true,
            lowercase: true,
            default: "home", // e.g., "home", "universities", "courses"
            index: true,
        },

        // ── Carousel / Slider Config ───────────────────────────
        isCarousel: {
            type: Boolean,
            default: false, // true = Multi-slide Slider, false = Single Static Hero Banner
        },
        carouselSettings: {
            autoplay: {
                type: Boolean,
                default: true,
            },
            autoplaySpeed: {
                type: Number,
                default: 5000, // milliseconds (5s)
            },
            effect: {
                type: String,
                enum: ["slide", "fade"],
                default: "slide",
            },
            showDots: {
                type: Boolean,
                default: true,
            },
            showArrows: {
                type: Boolean,
                default: true,
            },
        },

        // ── Single Banner Backup (Used when isCarousel = false) ──
        title: {
            type: String,
            trim: true,
            default: "",
        },
        subtitle: {
            type: String,
            trim: true,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        badge: {
            type: String,
            trim: true,
            default: "",
        },
        image: {
            type: Schema.Types.ObjectId,
            ref: "Media",
            default: null,
        },
        bgImage: {
            type: Schema.Types.ObjectId,
            ref: "Media",
            default: null,
        },
        mobileImage: {
            type: Schema.Types.ObjectId,
            ref: "Media",
            default: null,
        },
        primaryCtaText: {
            type: String,
            trim: true,
            default: "",
        },
        primaryCtaLink: {
            type: String,
            trim: true,
            default: "",
        },

        // ── Slides Array (Used when isCarousel = true) ────────
        slides: [slideSchema],

        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes
heroSchema.index({ page: 1, enabled: 1, removed: 1 });

const Hero = mongoose.model("Hero", heroSchema);

module.exports = { Hero };