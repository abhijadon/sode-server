const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    removed: {
        type: Boolean,
        default: false
    },
    enabled: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: [true, "Location name is required"],
        trim: true
    },
    desc: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
        required: [true, "Location slug is required"],
        trim: true,
        lowercase: true,
        unique: true
    },
    pincode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pincode",
        required: [true, "Pincode reference is required"],
        index: true
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
        required: [true, "City reference is required"],
        index: true
    }
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);

module.exports = { Location };