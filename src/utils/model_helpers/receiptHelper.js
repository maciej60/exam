
const _ = require("lodash");
const generator = require("generate-password");
const strings = require("locutus/php/strings");
const Receipt = require("../../models/Receipt");
const RrsCode = require("../../models/RrsCode");
const utils = require("..");
const time = new Date(Date.now()).toLocaleString();



module.exports = {

  createRrsCodeReceipt: async ({ rrs_code_id, data }) => {
    const create = await Receipt.create(data);
    await RrsCode.findByIdAndUpdate(
      rrs_code_id,
      { $push: { receipts: create._id } },
      { new: true }
    );
    return create;
  },

  getReceipt: async (data) => {
    const v = await Receipt.findOne(data);
    return v;
  },
};