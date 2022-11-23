const mongoose = require('mongoose');

const oSchema = new mongoose.Schema({
        head: {
            type: String,
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
        forSystemAdmin: {
            type: Number,
            default: 0,
        },
        forInstitutionAdmin: {
            type: Number,
            default: 0,
        },
        children: Array
    }
);

module.exports = mongoose.model('SystemMenu', oSchema, 'system_menus');
