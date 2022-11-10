const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const candidateEducation = new mongoose.Schema({
        qualification: String,
        school: String,
        grade: String,
        yearFrom: {
            type: Number,
            default: 0,
        },
        yearTo: {
            type: Number,
            default: 0,
        },
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

candidateEducation.plugin(mongoosePaginate);
candidateEducation.plugin(aggregatePaginate);
module.exports = mongoose.model('CandidateEducation', candidateEducation, 'candidate_educations');
