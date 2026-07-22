const mongoose = require('mongoose')

const citySchema = new mongoose.Schema({
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
        required: [true, "City name is required"],
        trim: true
    },
    desc: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
        required: [true, "City slug is required"],
        trim: true,
        unique: true
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "State",
        required: [true, "State reference is required"]
    },
}, { timestamps: true })

const City = mongoose.model("City", citySchema)

module.exports = { City }
