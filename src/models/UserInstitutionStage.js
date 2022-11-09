const mongoose = require('mongoose');

const userInstitutionStageSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
        institutionStageId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institution_stages",
        },
        stageLevel: Number,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
    },
    { timestamps: true }
);
userInstitutionStageSchema.index({ "userId": 1, "institutionStageId": 1}, { "unique": true });
userInstitutionStageSchema.index({ "userId": 1, "institutionStageId": 1, "stageLevel": 1}, { "unique": true });
module.exports = mongoose.model('user_institution_stages', userInstitutionStageSchema);
