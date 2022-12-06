const fs = require("fs");
const _ = require("lodash");
const Token = require("../../models/Token");
const utils = require("../");
const {is_null} = require("locutus/php/var");
const time = new Date(Date.now()).toLocaleString();

module.exports = {

  /**
   * Token
   * @param data
   * @returns {Promise<data>}
   */
  createToken: async (data) => {
    return Token.create(data);
  },

  getToken: async (where) => {
    return Token.find(where);
  },

  findUpdate: async ({
                       filter: filter,
                       update: update,
                       options: options,
                     }) => {
    let res;
    let result;
    let check = await Token.findOne(filter);
    if (!check || is_null(check)) {
      return {result: false, message: "Token invalid"};
    } else {
      res = await Token.findOneAndUpdate(filter, update, options);
    }
    result = res.toObject();
    if (result) {
      result.id = result._id;
    }
    return { result, message: "successful" };
  },





};