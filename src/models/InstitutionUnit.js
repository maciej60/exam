const mongoose = require('mongoose');

const institutionUnitSchema = new mongoose.Schema({
        name: String,
        code: String,
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Institution",
        },
        ministryId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "InstitutionMinistry",
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "InstitutionDepartment",
        },
        status: {
            type: Number,
            default: 1,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true });
institutionUnitSchema.index({ "name": 1, "departmentId": 1}, { "unique": true });
institutionUnitSchema.index({ "code": 1, "departmentId": 1}, { "unique": true });

module.exports = mongoose.model('InstitutionUnit', institutionUnitSchema, 'institution_units');
