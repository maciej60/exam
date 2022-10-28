const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const RrsCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    rrsCode: {
      type: String,
      required: true,
      unique: true,
    },
    rrsCodeMonth: Number,
    rrsCodeYear: Number,
    rrsCodeData: Object,
    rrsCodeStatus: {
      type: Number,
      default: 1,
    },
    receipts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "receipts",
    },
  },
  { timestamps: true }
);
RrsCodeSchema.plugin(mongoosePaginate);
RrsCodeSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("rrs_codes", RrsCodeSchema);
