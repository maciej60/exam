const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        address: String,
    }
);

module.exports = mongoose.model('Business', businessSchema, 'businesses');
