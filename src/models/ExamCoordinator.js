const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const examCoordinatorSchema = new mongoose.Schema({
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
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);
examCoordinatorSchema.index({ "examId": 1, "userId": 1}, { "unique": true });

examCoordinatorSchema.plugin(mongoosePaginate);
examCoordinatorSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('ExamCoordinator', examCoordinatorSchema, 'exam_coordinator');
