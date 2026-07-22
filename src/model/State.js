const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
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
        required: [true, "State name is required"],
        trim: true
    },
    desc: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
        required: [true, "State slug is required"],
        trim: true,
        unique: true
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: [true, "Country reference is required"]
    }
}, { timestamps: true })

const State = mongoose.model("State", stateSchema)

module.exports = {
    State
}