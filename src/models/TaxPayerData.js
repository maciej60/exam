const mongoose = require('mongoose');

const TaxPayerDataSchema = new mongoose.Schema(
  {
    taxId: {
      type: String,
      required: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    taxPayerData: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("tax_payer_data", TaxPayerDataSchema);
