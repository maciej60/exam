const mongoose = require('mongoose');

const subTopicSchema = new mongoose.Schema({
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
        topicId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institution_subject_topics",
        },
        tags: Array,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
    },
    { timestamps: true });

subTopicSchema.index({ "name": 1, "topicId": 1}, { "unique": true });
subTopicSchema.index({ "code": 1, "topicId": 1}, { "unique": true });
module.exports = mongoose.model('institution_sub_topics', subTopicSchema);
