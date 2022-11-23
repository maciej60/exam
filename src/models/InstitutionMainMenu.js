const mongoose = require('mongoose');

/**
 * while fetching, get the systemMenu route only because it might be updated, then append the title
 * and target to build a new menu object
 */
const oSchema = new mongoose.Schema({
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Institution",
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
        /*children: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SystemMenu",
            },
        ],*/
    }
);

module.exports = mongoose.model('InstitutionMainMenu', oSchema, 'institution_main_menu');
