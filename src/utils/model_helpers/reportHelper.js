
const fs = require("fs");
const _ = require("lodash");
const generator = require("generate-password");
const moment = require("moment");
const strings = require("locutus/php/strings");
const User = require("../../models/User");
const Receipt = require("../../models/Receipt");
const Reward = require("../../models/Reward");
const RrsCode = require("../../models/RrsCode");
const DeletedData = require("../../models/DeletedData");
const TaxPayerData = require("../../models/TaxPayerData");
const utils = require("..");
const number_format = require("locutus/php/strings/number_format");
const time = new Date(Date.now()).toLocaleString();

module.exports = {
  getUsers: async (data) => {
    const v = await User.find(data);
    return v;
  },

  getUserItemsSingleFieldsUsingDistinct: async (data) => {
    let model = data.model
      ? require("../../models/" + data.model)
      : require("../../models/User");
    const v = await model.distinct(data.fields, data.where);
    return v;
  },

  getUserItemsMultipleFieldsUsingQuery: async (data) => {
    let model = data.model
      ? require("../../models/" + data.model)
      : require("../../models/User");
    const v = await model.find(data.where).select(data.fields);
    return v;
  },

  getUsers: async (params) => {
    const { where, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    const v = User.aggregate([
      {
        $match: where,
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          __v: 0,
          userData: 0,
          passwordResets: 0,
          password: 0,
        },
      },
    ]).addFields({
      userTypeText: {
        $function: {
          body: function (userType) {
            return userType == 1 ? "Individual" : "Company";
          },
          args: ["$userType"],
          lang: "js",
        },
      },
      isAdminText: {
        $function: {
          body: function (isAdmin) {
            return isAdmin == 1 ? "Yes" : "No";
          },
          args: ["$isAdmin"],
          lang: "js",
        },
      },
    });
    const result = User.aggregatePaginate(v, options, function (err, results) {
      if (err) {
        console.log(err);
      } else {
        return results;
      }
    });
    return result;
  },

  getRrsCodes: async (params) => {
    const { where, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    let rrs_code_where = where;
    const v = RrsCode.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "rrs_code_user",
        },
      },
      {
        $match: rrs_code_where,
      },
      { $unwind: "$rrs_code_user" },
      {
        $lookup: {
          from: "receipts",
          let: { r: "$receipts" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$r"],
                  /* $eq: [
                  '$User_ID', '$$ID'
                  ],
                  $gt: [
                  '$quantity', 5
                  ] */
                },
              },
            },
          ],
          as: "rrs_code_receipts",
        },
      },
      // { $unwind: "$rrs_code_receipts" },
      // if you do this here and there are 2 receipts, it will return 2 seperate result sets but if u remove it, it return 1 result with 2 arrays of receipts
      { $sort: { createdAt: -1 } },
      {
        $project: {
          rrsCodeData: 0,
          "rrs_code_user.userData": 0,
          "rrs_code_user.password": 0,
          "rrs_code_user.passwordResets": 0,
        },
      },
    ]).addFields({
      username: {
        $concat: [
          "$rrs_code_user.lastName",
          " ",
          "$rrs_code_user.firstName",
          " ",
          "$rrs_code_user.middleName",
        ],
      },
      rrsCodeMonthDisplay: {
        $function: {
          body: function (rrsCodeMonth) {
            let months = [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ];
            return months[rrsCodeMonth - 1];
          },
          args: ["$rrsCodeMonth"],
          lang: "js",
        },
      },
    });
    const result = await RrsCode.aggregatePaginate(
      v,
      options,
      function (err, results) {
        if (err) {
          console.log(err);
        } else {
          return results;
        }
      }
    );
    return result;
  },

  getReceipts: async (params) => {
    const { where, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    let receipt_where = where;
    const v = Receipt.aggregate([
      {
        $lookup: {
          from: "rrs_codes",
          localField: "rrsCodeId",
          foreignField: "_id",
          as: "receipt_rrs_code",
        },
      },
      {
        $match: receipt_where,
      },
      { $unwind: "$receipt_rrs_code" },
      {
        $lookup: {
          from: "users",
          localField: "receipt_rrs_code.userId",
          foreignField: "_id",
          as: "rrs_code_user",
        },
      },
      { $unwind: "$rrs_code_user" },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          receiptData: 0,
          "receipt_rrs_code.rrsCodeData": 0,
          "rrs_code_user.userData": 0,
          "rrs_code_user.password": 0,
          "rrs_code_user.passwordResets": 0,
        },
      },
    ]);
    const result = await Receipt.aggregatePaginate(
      v,
      options,
      function (err, results) {
        if (err) {
          console.log(err);
        } else {
          return results;
        }
      }
    );
    return result;
  },
};