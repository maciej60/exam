
const fs = require("fs");
const _ = require("lodash");
const generator = require("generate-password");
const moment = require("moment");
const strings = require("locutus/php/strings");
const RrsCode = require("../../models/RrsCode");
const User = require("../../models/User");
const utils = require("../");
const time = new Date(Date.now()).toLocaleString();

async function generateRRS(append = "", prepend = "") {
  code = generator.generate({
    length: 6,
    numbers: true,
    symbols: false,
    uppercase: false,
    lowercase: false,
  });
  check = await utils.currDayMonthYear();
  code = code + await utils.twoDigits(check.month) + check.year;
  if (!_.isEmpty(append)) code = append + code;
  if (!_.isEmpty(prepend)) code = code + prepend;
  const v = await RrsCode.findOne({
    rrsCode: code,
  });
  if (v) {
    await generateRRS();
  }
  return code;
}

module.exports = {
  generateRRS: async (append = "", prepend = "") => {
    code = await generateRRS(append, prepend);
    return code;
  },

  getRrsUserForCurrMonthYear: async (data) => {
    const v = await RrsCode.findOne(data);
    return v;
  },

  getRrsCode: async (data) => {
    const v = await RrsCode.findOne(data);
    return v;
  },

  /* createRrsCode: async (data) => {
    const create = await RrsCode.create(data);
    return create;
  }, */

  createUserRrsCode: async ({ user_id, data }) => {
    const create = await RrsCode.create(data);
    await User.findByIdAndUpdate(
      user_id,
      { $push: { rrsCodes: create._id } },
      { new: true }
    );
    return create;
  },
};