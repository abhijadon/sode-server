const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
    removed: {
        type: Boolean,
        default: false
    },
    enabled: {
        type: Boolean,
        default: true
    },
    code: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
        unique: true,
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
        required: [true, "City reference is required"]
    }
}, { timestamps: true });

const Pincode = mongoose.model("Pincode", pincodeSchema);

module.exports = { Pincode };