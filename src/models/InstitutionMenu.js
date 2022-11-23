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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    }
);

module.exports = mongoose.model('InstitutionMenu', oSchema, 'institution_menu');
