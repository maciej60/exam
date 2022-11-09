const mongoose = require('mongoose');

const applicationDocumentTypeSchema = new mongoose.Schema({
    name: String,
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "institutions",
    },
    maxFileSizeInKb: {
        type: Number,
        default: 2000
    },
    allowedExtensions: Array,
    status: {
        type: Number,
        default: 1,
    },
})

module.exports = mongoose.model('application_document_types', applicationDocumentTypeSchema);
