const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        }
    }
);

module.exports = mongoose.model('grades', gradeSchema);
