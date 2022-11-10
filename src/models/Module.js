const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        }
    }
);

module.exports = mongoose.model('Module', moduleSchema, 'modules');
