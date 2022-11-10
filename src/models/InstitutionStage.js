const mongoose = require('mongoose');

const institutionStageSchema = new mongoose.Schema({
        name: String,
        code: String,
        sequence: Number,
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institutions",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
    },
    { timestamps: true }
);
institutionStageSchema.index({ "name": 1, "institutionId": 1}, { "unique": true });
institutionStageSchema.index({ "code": 1, "institutionId": 1}, { "unique": true });
module.exports = mongoose.model('institution_stages', institutionStageSchema);