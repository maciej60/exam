const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const DrawSchema = new mongoose.Schema(
  {
    drawMonth: Number,
    drawYear: Number,
    drawDescription: String,
    drawStatus: {
      type: Number,
      default: 1,
    },
    noOfRewards: {
      type: Number,
      default: 1,
    },
    drawCriteria: Object,
    rewards: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rewards",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  { timestamps: true }
);
DrawSchema.plugin(mongoosePaginate);
DrawSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("draws", DrawSchema);
