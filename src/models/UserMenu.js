const mongoose = require('mongoose');

const oSchema = new mongoose.Schema({
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Institution",
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        institutionMenuId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InstitutionMenu",
        },
        title: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        target: {
            type: String,
        },
        route: {
            type: mongoose.Schema.Types.Mixed,
        },
        href: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
            trim: true,
        },
        children: Array,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);
oSchema.index({ "userId": 1, "institutionMenuId": 1}, { "unique": true });
oSchema.index({ "userId": 1, "title": 1}, { "unique": true });
module.exports = mongoose.model('UserMenu', oSchema, 'user_menu');
