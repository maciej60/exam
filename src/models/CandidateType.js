const mongoose = require('mongoose');

const candidateTypeSchema = new mongoose.Schema({
        name: String,
    }
);

module.exports = mongoose.model('candidate_types', candidateTypeSchema);
