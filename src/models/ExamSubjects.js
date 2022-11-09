const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const examSubjectSchema = new mongoose.Schema({
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
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institution_subjects",
        },
        subjectMark: Number,
        subjectNumberOfQuestions: Number,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
    },
    { timestamps: true }
);
examSubjectSchema.index({ "examId": 1, "subjectId": 1}, { "unique": true });

examSubjectSchema.plugin(mongoosePaginate);
examSubjectSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('exam_subjects', examSubjectSchema);
