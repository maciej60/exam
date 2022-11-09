const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const candidateSchool = new mongoose.Schema({
        schoolRegistrationNumber: String,
        jambRegistrationNumber: String,
        school: String,
        programme: String,
        faculty: String,
        department: String,
        course: String,
        level: Number,
        class: String,
        admissionDate: Date,
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "candidates",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
    },
    { timestamps: true }
);

candidateSchool.plugin(mongoosePaginate);
candidateSchool.plugin(aggregatePaginate);
module.exports = mongoose.model('candidate_school', candidateSchool);
