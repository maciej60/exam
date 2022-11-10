const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const examQuestionSchema = new mongoose.Schema({
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Institution",
        },
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Exam",
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "InstitutionSubject",
        },
        topicId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "InstitutionSubjectTopic",
        },
        subTopicId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "InstitutionSubTopic",
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "QuestionBank",
        },
        questionMark: Number,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);
examQuestionSchema.index({ "examId": 1, "questionId": 1}, { "unique": true });

examQuestionSchema.plugin(mongoosePaginate);
examQuestionSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('ExamQuestion', examQuestionSchema, 'exam_questions');
