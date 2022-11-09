const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const questionBankSchema = new mongoose.Schema({
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institutions",
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institution_subjects",
        },
        topicId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institution_subject_topics",
        },
        questionType: String,
        question: String,
        options: Array,
        answer: {
            type: mongoose.Schema.Types.Mixed
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
    },
    { timestamps: true }
);
questionBankSchema.index({ "examId": 1, "subjectId": 1}, { "unique": true });

questionBankSchema.plugin(mongoosePaginate);
questionBankSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('question_bank', questionBankSchema);
