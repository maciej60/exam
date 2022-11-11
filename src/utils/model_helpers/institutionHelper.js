
const fs = require("fs");
const _ = require("lodash");
const generator = require("generate-password");
const moment = require("moment");
const strings = require("locutus/php/strings");
const Institution = require("../../models/Institution");
const User = require("../../models/User");
const utils = require("../");
const time = new Date(Date.now()).toLocaleString();

async function generateInstitutionCode(append = "", prepend = "") {
  let code = generator.generate({
    length: 5,
    numbers: true,
    symbols: false,
    uppercase: false,
    lowercase: false,
  });
  if (!_.isEmpty(append)) code = append + code;
  if (!_.isEmpty(prepend)) code = code + prepend;
  const v = await Institution.findOne({
    institutionCode: code,
  });
  if (v) {
    await generateInstitutionCode();
  }
  return code;
}

module.exports = {
  generateInstitutionCode: async (append = "", prepend = "") => {
    return await generateInstitutionCode(append, prepend);
  },

  getInstitutionCode: async (data) => {
    return Institution.findOne(data);
  },

  /* createRrsCode: async (data) => {
    const create = await RrsCode.create(data);
    return create;
  }, */

  /*createUserRrsCode: async ({ user_id, data }) => {
    const create = await RrsCode.create(data);
    await User.findByIdAndUpdate(
      user_id,
      { $push: { rrsCodes: create._id } },
      { new: true }
    );
    return create;
  },*/
};