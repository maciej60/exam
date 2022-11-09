const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const candidateEmployment = new mongoose.Schema({
        employmentNumber: String,
        dateOfFirstAppointment: Date,
        ministry: String,
        department: String,
        salaryStructure: String,
        gradeLevel: String,
        step: Number,
        designation: String,
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
)

candidateEmployment.plugin(mongoosePaginate);
candidateEmployment.plugin(aggregatePaginate);
module.exports = mongoose.model('candidate_employment', candidateEmployment);
