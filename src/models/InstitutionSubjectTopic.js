const mongoose = require('mongoose');

const institutionSubjectTopicSchema = new mongoose.Schema({
        name: String,
        code: String,
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Institution",
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "InstitutionSubject",
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

institutionSubjectTopicSchema.index({ "name": 1, "subjectId": 1}, { "unique": true });
institutionSubjectTopicSchema.index({ "code": 1, "subjectId": 1}, { "unique": true });
module.exports = mongoose.model('InstitutionSubjectTopic', institutionSubjectTopicSchema, 'institution_subject_topics');
