const mongoose = require('mongoose')

const countrySchema = new mongoose.Schema({
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
        required: [true, "Country name is required"],
        trim: true
    },
    desc: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
        required: [true, "Country slug is required"],
        trim: true,
        unique: true
    }
}, { timestamps: true })

const Country = mongoose.model("Country", countrySchema)

module.exports = { Country }
