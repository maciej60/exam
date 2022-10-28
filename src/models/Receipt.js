const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
//const slugify = require('slugify');

function getDecimal(value) {
  if (typeof value !== "undefined") {
    return parseFloat(value.toString());
  }
  return value;
}

const ReceiptSchema = new mongoose.Schema(
  {
    rrsCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "rrs_codes",
    },
    receiptItemName: {
      type: String,
    },
    receiptItemCode: {
      type: String,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    receiptAmount: {
      type: Number,
      default: 0.0,
    },
    receiptDate: {
      type: Date,
    },
    receiptData: Object,
    paymentMethod: {
      type: String,
      trim: true,
    },
    depositorName: String,
    depositorSlipNumber: {
      type: String,
      trim: true,
    },
    receiptStatus: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

ReceiptSchema.pre("save", function (next) {
  this.receiptNumber = this.receiptNumber;
  next();
});

ReceiptSchema.post("init", function () {
  //this.where({ deleted: false });
  //this.receiptNumber = "tttttt" + this.receiptNumber; //parseFloat(this.receiptAmount);
  this.receiptAmount = parseFloat(this.receiptAmount.toString());
});

/* ReceiptSchema.post("find", async function (docs) {
  for(let doc of docs){
    await doc
      .populate({ path: "rrsCodeId", select: ["rrsCode"] })
      .execPopulate();
  }
}); */

ReceiptSchema.plugin(mongoosePaginate);
ReceiptSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("receipts", ReceiptSchema);
