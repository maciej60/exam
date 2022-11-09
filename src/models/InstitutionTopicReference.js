const mongoose = require('mongoose');

const topicReferenceSchema = new mongoose.Schema({
        title: String,
        url: String,
        author: String,
        fileType: String,
        fileSizeInKb: Number,
        publicationYear: Number,
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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
    },
    { timestamps: true });

topicReferenceSchema.index({ "title": 1, "topicId": 1, "author": 1}, { "unique": true });
module.exports = mongoose.model('institution_subject_topics', topicReferenceSchema);
