const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const EmailLogSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    requestData: Object,
    responseData: Object,
    emailLogStatus: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);
EmailLogSchema.plugin(mongoosePaginate);
EmailLogSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("email_logs", EmailLogSchema);
