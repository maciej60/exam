const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const UssdLogSchema = new mongoose.Schema(
  {
    receiptId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "receipts",
    },
    sessionId: {
      type: String,
    },
    requestPhone: {
      type: String,
    },
    requestData: Object,
    responseData: Object,
    ussdLogStatus: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);
UssdLogSchema.plugin(mongoosePaginate);
UssdLogSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("ussd_logs", UssdLogSchema);
