const mongoose = require('mongoose');

const candidateTypeSchema = new mongoose.Schema({
        name: String,
    }
);

module.exports = mongoose.model('CandidateType', candidateTypeSchema, 'candidate_types');
