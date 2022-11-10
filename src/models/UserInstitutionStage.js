const mongoose = require('mongoose');

const userInstitutionStageSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        institutionStageId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "InstitutionStage",
        },
        stageLevel: Number,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true }
);
userInstitutionStageSchema.index({ "userId": 1, "institutionStageId": 1}, { "unique": true });
userInstitutionStageSchema.index({ "userId": 1, "institutionStageId": 1, "stageLevel": 1}, { "unique": true });
module.exports = mongoose.model('UserInstitutionStage', userInstitutionStageSchema, 'user_institution_stages');
