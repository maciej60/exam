const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const candidateNextOfKin = new mongoose.Schema({
        name: String,
        address: Date,
        phone: String,
        email: String,
        occupation: String,
        relationship: String,
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
    { timestamps: true })

candidateNextOfKin.plugin(mongoosePaginate);
candidateNextOfKin.plugin(aggregatePaginate);
module.exports = mongoose.model('candidate_next_of_kin', candidateNextOfKin);
