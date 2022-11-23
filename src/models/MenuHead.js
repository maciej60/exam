const mongoose = require('mongoose');

const oSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            unique: true,
        },
    }
);

module.exports = mongoose.model('MenuHead', oSchema, 'menu_heads');
