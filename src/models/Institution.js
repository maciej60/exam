const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");

const institutionConfig = new mongoose.Schema({
    enable2wa: {
        type: Number,
        default: 0
    },
    anyCanReview: {
        type: Number,
        default: 0
    },
})

const InstitutionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        institutionCode: {
            type: String,
            trim: true,
            unique: true
        },
        address: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        institutionConfig,
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "business",
        },
        modules: Array,
    },
    { timestamps: true }
);
InstitutionSchema.pre("save", function (next) {
    /**
     * if password is not provided, put this bcrypt code for 'password'
     */
    this.name =
        !_.isEmpty(this.name) && this.name != null
            ? this.name.toUpperCase()
            : "";
    this.email =
        !_.isEmpty(this.email) && this.email != null
            ? this.email.toLowerCase()
            : "";
    next();
});

InstitutionSchema.pre("updateOne", function () {
    /**
     * here we have access to the query object not the data object because mongoose will query the doc before updating
     * so u can only modify the query object so as to fetch the correct data for the update
     */
    this.set({ name: this._update.$set.name.toUpperCase() });
    this.set({ email: this._update.$set.email.toLowerCase() });
});

InstitutionSchema.plugin(mongoosePaginate);
InstitutionSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('institutions', InstitutionSchema);
