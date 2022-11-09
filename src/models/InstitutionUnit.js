const mongoose = require('mongoose');

const institutionUnitSchema = new mongoose.Schema({
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
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institution_departments",
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
institutionUnitSchema.index({ "name": 1, "departmentId": 1}, { "unique": true });
institutionUnitSchema.index({ "code": 1, "departmentId": 1}, { "unique": true });

module.exports = mongoose.model('institution_units', institutionUnitSchema);
