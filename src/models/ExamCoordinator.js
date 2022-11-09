const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const examCoordinatorSchema = new mongoose.Schema({
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
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
    },
    { timestamps: true }
);
examCoordinatorSchema.index({ "examId": 1, "userId": 1}, { "unique": true });

examCoordinatorSchema.plugin(mongoosePaginate);
examCoordinatorSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('exam_coordinator', examCoordinatorSchema);
