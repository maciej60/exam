const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const SmsLogSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    requestData: Object,
    responseData: Object,
    smsLogStatus: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);
SmsLogSchema.plugin(mongoosePaginate);
SmsLogSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("SmsLog", SmsLogSchema, 'sms_logs');
