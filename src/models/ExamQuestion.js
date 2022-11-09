const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const examQuestionSchema = new mongoose.Schema({
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institutions",
        },
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "exams",
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "question_bank",
        },
        questionMark: Number,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
    },
    { timestamps: true }
);
examQuestionSchema.index({ "examId": 1, "questionId": 1}, { "unique": true });

examQuestionSchema.plugin(mongoosePaginate);
examQuestionSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('exam_questions', examQuestionSchema);
