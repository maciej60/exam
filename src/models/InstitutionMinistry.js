const mongoose = require('mongoose');

const institutionMinistrySchema = new mongoose.Schema({
        name: String,
        code: String,
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institutions",
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
institutionMinistrySchema.index({ "name": 1, "institutionId": 1}, { "unique": true });
institutionMinistrySchema.index({ "code": 1, "institutionId": 1}, { "unique": true });

module.exports = mongoose.model('institution_ministries', institutionMinistrySchema);
