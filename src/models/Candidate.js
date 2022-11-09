const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");
const generator = require("generate-password");
const utils = require("../utils");

const isUser = new mongoose.Schema({
    yes: {
        type: Number,
        default: 0,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }
});

const CandidateSchema = new mongoose.Schema(
    {
        isUser,
        title: String,
        firstName: {
            type: String,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        middleName: {
            type: String,
            trim: true,
        },
        candidateCode: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
        },
        candidateType: {
            type: String,
            default: 'Employee',
        },
        gender: {
            type: String,
            trim: true,
        },
        photoUrl: {
            type: String,
            trim: true,
        },
        firstLogin: {
            type: Number,
            default: 1,
            enum: [0, 1, 2],
        },
        status: {
            type: Number,
            default: 1,
        },
        passwordResets: Array,
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "institutions",
        },
    },
    { timestamps: true }
);
CandidateSchema.index({ "email": 1, "institutionId": 1}, { "unique": true });
CandidateSchema.index({ "phone": 1, "institutionId": 1}, { "unique": true });
CandidateSchema.pre("save", function (next) {
    /**
     * if password is not provided, put this bcrypt code for 'password'
     */
    if (!this.password || _.isEmpty(this.password)) {
        let pw = generator.generate({
            length: 12,
            numbers: true,
            uppercase: true,
            lowercase: true,
            symbols: true,
        });
        let pw_hashed = utils.hashPassword(pw);
        this.password = pw_hashed;
        this.passwordResets.push(pw_hashed);
    }
    this.firstName =
        !_.isEmpty(this.firstName) && this.firstName != null
            ? this.firstName.toUpperCase()
            : "";
    this.lastName =
        !_.isEmpty(this.lastName) && this.lastName != null
            ? this.lastName.toUpperCase()
            : "";
    this.middleName =
        !_.isEmpty(this.middleName) && this.middleName != null
            ? this.middleName.toUpperCase()
            : "";
    next();
});

CandidateSchema.pre("updateOne", function () {
    /**
     * here we have access to the query object not the data object because mongoose will query the doc before updating
     * so u can only modify the query object to fetch the correct data for the update
     */
    this.set({ firstName: this._update.$set.firstName.toUpperCase() });
    this.set({ lastName: this._update.$set.lastName.toUpperCase() });
    this.set({ middleName: this._update.$set.middleName.toUpperCase() });
    this.set({ email: this._update.$set.email.toLowerCase() });
});

CandidateSchema.plugin(mongoosePaginate);
CandidateSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('candidates', CandidateSchema);
