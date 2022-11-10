const mongoose = require('mongoose');

const subTopicSchema = new mongoose.Schema({
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
        topicId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "InstitutionSubjectTopic",
        },
        tags: Array,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true });

subTopicSchema.index({ "name": 1, "topicId": 1}, { "unique": true });
subTopicSchema.index({ "code": 1, "topicId": 1}, { "unique": true });
module.exports = mongoose.model('InstitutionSubTopic', subTopicSchema, 'institution_sub_topics');
