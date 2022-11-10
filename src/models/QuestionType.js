const mongoose = require('mongoose');

const questionTypeSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        }
    }
);

module.exports = mongoose.model('QuestionType', questionTypeSchema, 'question_types');
