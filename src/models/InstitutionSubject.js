const mongoose = require('mongoose');

const institutionSubjectSchema = new mongoose.Schema({
        name: String,
        code: String,
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Institution",
        },
        status: {
            type: Number,
            default: 1,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true });
institutionSubjectSchema.index({ "name": 1, "institutionId": 1}, { "unique": true });
institutionSubjectSchema.index({ "code": 1, "institutionId": 1}, { "unique": true });

module.exports = mongoose.model('InstitutionSubject', institutionSubjectSchema, 'institution_subjects');
