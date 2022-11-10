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
            ref: "Candidate",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true }
);

candidateSchool.plugin(mongoosePaginate);
candidateSchool.plugin(aggregatePaginate);
module.exports = mongoose.model('CandidateSchool', candidateSchool, 'candidate_schools');
