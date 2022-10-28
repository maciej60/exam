const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const _ = require("lodash");
const generator = require("generate-password"); 
const utils = require("../utils");

const UserSchema = new mongoose.Schema(
  {
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
    companyName: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    taxId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    userType: {
      type: Number,
      default: 1,
    },
    project: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    homeLga: {
      type: String,
      trim: true,
    },
    homeState: {
      type: String,
      trim: true,
    },
    homeTown: {
      type: String,
      trim: true,
    },
    homeAddress: {
      type: String,
      trim: true,
    },
    agentType: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      trim: true,
    },
    bvn: {
      type: String,
      trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    userData: {
      type: Object,
    },
    isAdmin: {
      type: Number,
      default: 0,
    },
    firstLogin: {
      type: Number,
      default: 1,
    },
    userStatus: {
      type: Number,
      default: 1,
    },
    passwordResets: Array,
    rrsCodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rrs_codes",
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
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
  this.companyName =
    !_.isEmpty(this.companyName) && this.companyName != null
      ? this.companyName.toUpperCase()
      : "";  
  if (parseInt(this.userType) == 1)
    this.userName = this.lastName + " " + this.firstName + " " + this.middleName;
  else this.userName = this.companyName;
  next();
});   

UserSchema.pre("updateOne", function () {
  /**
   * here we have access to the query object not the data object because mongoose will query the doc before updating
   * so u can only modify the query object so as to fetch the correct data for the update
   */
  this.set({ firstName: this._update.$set.firstName.toUpperCase() });
  this.set({ lastName: this._update.$set.lastName.toUpperCase() });
  this.set({ middleName: this._update.$set.middleName.toUpperCase() });
  this.set({ email: this._update.$set.email.toLowerCase() });
  let u = "";
  if (parseInt(this._update.$set.userType) == 1)
    u =
      this._update.$set.lastName +
      " " +
      this._update.$set.firstName +
      " " +
      this._update.$set.middleName;
  else u = this._update.$set.companyName;
  this.set({ userName: u.toUpperCase() });
});

/* UserSchema.virtual("userName").get(function () {
  let name = "";
  if (parseInt(this.userType) == 1)
    name = this.lastName + " " + this.firstName + " " + this.middleName;
  else name = this.companyName;
  return name;
}); */

/* UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true }); */

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('users', UserSchema);
