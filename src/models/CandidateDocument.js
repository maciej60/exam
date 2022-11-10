const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const candidateDocument = new mongoose.Schema({
        documentType: String,
        fileName: String,
        fileType: Array,
        fileSizeInKb: Number,
        url: String,
        storagePath: String,
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Institution",
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
candidateDocument.index({ "documentType": 1, "institutionId": 1, "candidateId": 1}, { "unique": true });

candidateDocument.plugin(mongoosePaginate);
candidateDocument.plugin(aggregatePaginate);
module.exports = mongoose.model('CandidateDocument', candidateDocument, 'candidate_documents');
