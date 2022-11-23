const fs = require("fs");
const _ = require("lodash");
const generator = require("generate-password");
const moment = require("moment");
const strings = require("locutus/php/strings");
const Business = require("../../models/Business");
const Institution = require("../../models/Institution");
const User = require("../../models/User");
const utils = require("../");
const Application = require("../../models/Application");
const {is_null} = require("locutus/php/var");
const time = new Date(Date.now()).toLocaleString();

async function generateInstitutionCode(append = "", prepend = "") {
  let code = generator.generate({
    length: 5,
    numbers: true,
    symbols: false,
    uppercase: true,
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
    return generateInstitutionCode(append, prepend);
  },

  createInstitution: async (data) => {
    return Institution.create(data);
  },

  getInstitutions: async (params) => {
    const { where, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    const v = Institution.aggregate([
      {
        $match: where,
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "businesses",
          localField: "businessId",
          foreignField: "_id",
          as: "institution_business",
        },
      },
      { $unwind: "$institution_business" },
      {
        $project: {
          __v: 0,
          status: 0,
          "institution_business.address": 0,
          "institution_business._id": 0,
        },
      },
    ]);
    return Institution.aggregatePaginate(v, options, function (err, results) {
      if (err) {
        console.log(err);
      } else {
        return results;
      }
    });
  },

  getInstitution: async (where) => {
    return Institution.find(where).populate({path: 'businessId'});
  },

  findUpdate: async ({
                       filter: filter,
                       update: update,
                       options: options,
                     }) => {
    let res;
    let result;
    let check = await Institution.findOne(filter);
    if (!check || is_null(check)) {
      return {result: false, message: "Institution provided do not exist"};
    } else {
      res = await Institution.findOneAndUpdate(filter, update, options);
    }
    result = res.toObject();
    if (result) {
      result.id = result._id;
    }
    return { result, message: "successful" };
  },

};