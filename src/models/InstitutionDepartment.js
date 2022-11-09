const mongoose = require('mongoose');

const institutionDepartmentSchema = new mongoose.Schema({
        name: String,
        code: String,
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institutions",
        },
        ministryId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institution_ministries",
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
institutionDepartmentSchema.index({ "name": 1, "ministryId": 1}, { "unique": true });
institutionDepartmentSchema.index({ "code": 1, "ministryId": 1}, { "unique": true });

module.exports = mongoose.model('institution_departments', institutionDepartmentSchema);
