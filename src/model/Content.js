const mongoose = require('mongoose')

const contentSchema = new mongoose.Schema({
    removed: {
        type: Boolean,
        default: false
    },
    enabled: {
        type: Boolean,
        default: true
    },
    title: {
        type: String,
        required: [true, "Content title is required"],
        trim: true
    },
    summary: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        trim: true
    },
    contentType: {
        type: String,
        required: [true, "Content type is required"],
        default: "page" // e.g. "page", "blog", "policy", "news"
    },
    slug: {
        type: String,
        required: [true, "Content slug is required"],
        trim: true,
        unique: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media",
        default: null
    },
    tags: {
        type: [String],
        default: []
    },
    metaTitle: {
        type: String,
        trim: true
    },
    metaDescription: {
        type: String,
        trim: true
    },
    metaKeywords: {
        type: [String],
        default: []
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const Content = mongoose.model("Content", contentSchema)

module.exports = { Content }