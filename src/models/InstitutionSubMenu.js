const mongoose = require('mongoose');

/**
 * while fetching, get the systemMenu route only because it might be updated, then append the title
 * and target to build a new sub menu object
 */
const oSchema = new mongoose.Schema({
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Institution",
        },
        institutionMainMenuId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InstitutionMainMenu",
        },
        systemMenuId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SystemMenu",
        },
        title: {
            type: String,
            trim: true,
        },
        target: {
            type: String,
        },
        icon: {
            type: String,
            trim: true,
        },
        hasSubMenu: Number,
    }
);

module.exports = mongoose.model('InstitutionSubMenu', oSchema, 'institution_sub_menu');
