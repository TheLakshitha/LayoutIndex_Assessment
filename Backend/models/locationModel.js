const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const deviceSchema = new Schema({
    serialNumber: {
        type: String,
        required: true,
        unique: true // Ensure serialNumber is unique
    },
    type: {
        type: String,
        enum: ['pos', 'kiosk', 'signage'],
        required: true
    },
    image: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
});

const locationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    devices: [deviceSchema]
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
