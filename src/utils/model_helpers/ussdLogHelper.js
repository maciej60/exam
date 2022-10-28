
const fs = require("fs");
const _ = require("lodash");
const generator = require("generate-password");
const strings = require("locutus/php/strings");
const UssdLog = require("../../models/UssdLog");
const utils = require("..");
const time = new Date(Date.now()).toLocaleString();



module.exports = {
  createUssdLog: async (data) => {
    const create = await UssdLog.create(data);
    return create;
  },

  getUssdLog: async (data) => {
    const v = await UssdLog.findOne(data);
    return v;
  },
};