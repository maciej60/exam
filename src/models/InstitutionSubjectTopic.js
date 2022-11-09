const mongoose = require('mongoose');

const institutionSubjectTopicSchema = new mongoose.Schema({
        name: String,
        code: String,
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institutions",
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institution_subjects",
        },
        status: {
            type: Number,
            default: 1,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
    },
    { timestamps: true });

institutionSubjectTopicSchema.index({ "name": 1, "subjectId": 1}, { "unique": true });
institutionSubjectTopicSchema.index({ "code": 1, "subjectId": 1}, { "unique": true });
module.exports = mongoose.model('institution_subject_topics', institutionSubjectTopicSchema);
