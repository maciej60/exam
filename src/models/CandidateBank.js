const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const candidateBank = new mongoose.Schema({
    accountName: String,
    accountNumber: String,
    grade: String,
    accountType: String,
    cbnCode: String,
    bvn: String,
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

candidateBank.plugin(mongoosePaginate);
candidateBank.plugin(aggregatePaginate);
module.exports = mongoose.model('CandidateBank', candidateBank, 'candidate_banks');
