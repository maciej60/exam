const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const RewardSchema = new mongoose.Schema(
  {
    drawId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "draws",
    },
    rrsCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "rrs_codes",
    },
    rewardData: Object,
    rewardDescription: String,
    rewardStatus: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);
RewardSchema.plugin(mongoosePaginate);
RewardSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("rewards", RewardSchema);
