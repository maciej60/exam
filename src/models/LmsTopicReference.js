const mongoose = require('mongoose');

const topicReferenceSchema = new mongoose.Schema({
        title: String,
        url: String,
        author: String,
        fileType: String,
        fileSizeInKb: Number,
        publicationYear: Number,
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
        subTopicId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "lms_sub_topics",
        },
        tags: Array,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
    },
    { timestamps: true });

topicReferenceSchema.index({ "title": 1, "subTopicId": 1, "author": 1}, { "unique": true });
module.exports = mongoose.model('lms_topic_references', topicReferenceSchema);
