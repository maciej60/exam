const fs = require("fs");
const _ = require("lodash");
const Token = require("../../models/Token");
const utils = require("../");
const {is_null} = require("locutus/php/var");
const generator = require("generate-password");
const time = new Date(Date.now()).toLocaleString();

async function generateToken(append = "", prepend = "") {
  let token = generator.generate({
    length: 52,
    numbers: true,
    symbols: false,
    uppercase: true,
    lowercase: true,
  });
  if (!_.isEmpty(append)) token = append + code;
  if (!_.isEmpty(prepend)) token = code + prepend;
  const v = await Token.findOne({
    token,
  });
  if (v) {
    await generateToken();
  }
  return token;
}

module.exports = {

  /**
   * Token
   * @returns String
   * @param append
   * @param prepend
   */
  generateToken: async (append = "", prepend = "") => {
    return await generateToken(append, prepend);
  },

  /**
   * Token
   * @param data
   * @returns {Promise<data>}
   */
  createToken: async (data) => {
    if(_.isEmpty(data.token)) data.token = await generateToken()
    return Token.create(data);
  },

  getToken: async (where) => {
    return Token.findOne(where);
  },

  processToken: async (obj) => {
    let find = await Token.findOne(obj.where);
    if(!_.isEmpty(find)){
      if(find.expired === 1) return {result: {}, message: `Token provided is expired!`}
      if(!find.data.hasOwnProperty(obj.dataColumn)) return {result: {}, message: `${obj.dataColumn} object is invalid!`}
      return {result: find, message: `success`}
    }else{
      return {result: {}, message: `Token provided is invalid!`}
    }
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