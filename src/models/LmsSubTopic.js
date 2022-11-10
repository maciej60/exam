const mongoose = require('mongoose');

const subTopicSchema = new mongoose.Schema({
        name: String,
        code: String,
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "lms_subjects",
        },
        topicId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "lms_subject_topics",
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
module.exports = mongoose.model('lms_sub_topics', subTopicSchema);
