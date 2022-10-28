
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
  createTaxPayerFromRevotax: async (data, cb) => {
      let resp = {
        status: "error",
        message: "",
        failed: [],
        successful: []
      };
      const bulk = TaxPayerData.collection.initializeUnorderedBulkOp();
      data.forEach((item) => {
        let _data = {
          receiptNumber: item.receiptNumber,
          taxId: item.taxId,
          taxPayerData: item,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        bulk.insert(_data);
      });
      await bulk.execute(function(err, result) {
        if (err) {          
          const errorReceipts = err.writeErrors.map(e => {
            /* 
            let indexInIncomingArray = e.err.index;
            let errorCodeForItem = e.err.code; // 11000 is duplicate
            let errorMessageForItem = e.err.errmsg;
            let itemInIncomingArray = e.err.op; 
            */
            return e.err.op.receiptNumber;
          });
          resp.message = err.message;
          resp.failed = errorReceipts;
          cb(resp);
        }
        if (result) {
          /*
          let ok = result.result.ok;
          let insertedIds = result.result.insertedIds; [ { index: 0, _id: 6152e8de34b0681b3f443ef7 } ]
          let nInserted = result.result.nInserted; 
          */
          resp.status = "success";
          resp.message = "Receipts recevied successful";
          resp.successful = [];
          cb(resp);
        }
      });
      return resp;
  },

  getTaxPayerFromRevotax: async (data) => {
    const v = await TaxPayerData.findOne(data);
    return v;
  },

  createUser: async (data) => {
    const create = await User.create(data);
    return create;
  },

  savePasswordReset: async ({ user_id, old_password, new_password }) => {
    const save = await User.findByIdAndUpdate(
      user_id,
      { $push: { passwordResets: old_password }, password: new_password, firstLogin: 0 },
      { new: true }
    );
    return save;
  },

  updateUser: async ({ filter: filter, update: update, options: options }) => {
    const updateUser = await User.updateOne(filter, update, options);
    return updateUser;
  },

  findUpsertUser: async ({
    filter: filter,
    update: update,
    options: options,
  }) => {
    const findUpsert = await User.findOneAndUpdate(filter, update, options);
    return findUpsert;
  },

  isAdmin: async (id) => {
    const v = await User.find({
      _id: id,
      isAdmin: 1,
    });
    return _.isEmpty(v) ? false : true;
  },

  getUser: async (data) => {
    const v = await User.findOne(data);
    return v;
  },

  getUsersPaginated: async (params) => {
    const { where, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    // const v = await User.find(where);
    const v = User.aggregate([
      {
        $match: where,
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          receiptData: 0,
          __v: 0,
          userData: 0,
          passwordResets: 0,
          password: 0,
          rrsCodes: 0,
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

  backupAndDelete: async (data) => {
    let { ids, deletedBy, model } = data;
    modelLoader = require("../../models/" + data.model);
    _.forEach(ids, async (u) => {
      if (u) {
        let deleteData = {
          deletedData: await modelLoader.findById(u),
          deletedModel: model,
          deletedBy,
        };
        await DeletedData.create(deleteData);
      }
    });
    const v = await modelLoader.deleteMany({ _id: { $in: ids } });
    console.log(v);
    return v;
  },

  getUserWithRrsCodes: async (id) => {
    return User.findById(id, { password: 0 })
      .populate("rrsCodes")
      .sort({ "rrsCodes.createdAt": -1 });
  },

  getUserMonthYearRrs: async (data, options = {}) => {
    return RrsCode.findOne(data, options).limit(1);
  },

  getUserHighestReceipt: async (data) => {
    const { taxId } = data;
    let receipt_where = {
      "receipt_rrs_code.rrsCodeStatus": 1,
    };
    let rrs_code_where = { "rrs_code_user.taxId": taxId };
    const v = await Receipt.aggregate([
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
      {
        $match: rrs_code_where,
      },
      { $unwind: "$rrs_code_user" },
      {
        $group: {
          _id: "$rrs_code_user._id",
          receipt_max: { $max: "$receiptAmount" },
        },
      },
    ]);
    if (_.isEmpty(v)) return 0;
    return v[0]["receipt_max"];
  },

  getUserTotalMonthlyReceipts: async (data) => {
    const { taxId, month, year } = data;
    let receipt_where = {
      "receipt_rrs_code.rrsCodeStatus": 1,
      "receipt_rrs_code.rrsCodeMonth": month,
      "receipt_rrs_code.rrsCodeYear": year,
    };
    let rrs_code_where = { "rrs_code_user.taxId": taxId };
    const v = await Receipt.aggregate([
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
      {
        $match: rrs_code_where,
      },
      { $unwind: "$rrs_code_user" },
      {
        $group: {
          _id: "$rrs_code_user._id",
          receipt_sum: { $sum: "$receiptAmount" },
        },
      },
      {
        $project: {
          receiptData: 0,
          __v: 0,
          "receipt_rrs_code.rrsCodeData": 0,
          "receipt_rrs_code._id": 0,
          "receipt_rrs_code.__v": 0,
          "receipt_rrs_code.receipts": 0,
          "rrs_code_user.rrsCodes": 0,
          "rrs_code_user._id": 0,
          "rrs_code_user.password": 0,
          "rrs_code_user.userData": 0,
          "rrs_code_user.__v": 0,
        },
      },
    ]);
    if (_.isEmpty(v)) return 0;
    return v[0]["receipt_sum"];
  },

  getUserRrsCodesCount: async (data) => {
    const { taxId } = data;
    let rrs_code_where = { "rrs_code_user.taxId": taxId };
    const v = await RrsCode.aggregate([
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
        $group: {
          _id: "$rrs_code_user._id",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          __v: 0,
          "rrs_code_user.rrsCodes": 0,
          "rrs_code_user._id": 0,
          "rrs_code_user.password": 0,
          "rrs_code_user.userData": 0,
          "rrs_code_user.__v": 0,
        },
      },
    ]);
    if (_.isEmpty(v)) return 0;
    return v[0]["count"];
  },

  getUserMonthlyReceiptCount: async (data) => {
    const { taxId, month, year } = data;
    let receipt_where = {
      "receipt_rrs_code.rrsCodeStatus": 1,
      "receipt_rrs_code.rrsCodeMonth": month,
      "receipt_rrs_code.rrsCodeYear": year,
    };
    let rrs_code_where = { "rrs_code_user.taxId": taxId };
    const v = await Receipt.aggregate([
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
      {
        $match: rrs_code_where,
      },
      { $unwind: "$rrs_code_user" },
      {
        $group: {
          _id: "$rrs_code_user._id",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          receiptData: 0,
          __v: 0,
          "receipt_rrs_code.rrsCodeData": 0,
          "receipt_rrs_code._id": 0,
          "receipt_rrs_code.__v": 0,
          "receipt_rrs_code.receipts": 0,
          "rrs_code_user.rrsCodes": 0,
          "rrs_code_user._id": 0,
          "rrs_code_user.password": 0,
          "rrs_code_user.userData": 0,
          "rrs_code_user.__v": 0,
        },
      },
    ]);
    if (_.isEmpty(v)) return 0;
    return v[0]["count"];
  },

  getUserRrsCodes: async (params) => {
    const { taxId, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    let rrs_code_where = { "rrs_code_user.taxId": taxId };
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
        $project: {
          rrsCodeData: 0,
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
    const result = RrsCode.aggregatePaginate(
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

  getUserReceipts: async (params) => {
    const { taxId, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    let receipt_where = { "receipt_rrs_code.rrsCodeStatus": 1 };
    let rrs_code_where = { "rrs_code_user.taxId": taxId };
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
      {
        $match: rrs_code_where,
      },
      { $unwind: "$rrs_code_user" },
      {
        $project: {
          receiptData: 0,
          __v: 0,
          "receipt_rrs_code.rrsCodeData": 0,
          "receipt_rrs_code._id": 0,
          "receipt_rrs_code.__v": 0,
          "receipt_rrs_code.receipts": 0,
          rrs_code_user: 0,
        },
      },
    ]).addFields({
      receiptAmountDisplay: {
        $function: {
          body: function (receiptAmount) {
            return receiptAmount
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          },
          args: ["$receiptAmount"],
          lang: "js",
        },
      },
    });
    const result = Receipt.aggregatePaginate(
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

  getUserRewards: async (taxId) => {
    let reward_where = { "reward_rrs_code.rrsCodeStatus": 1 };
    let rrs_code_where = { "rrs_code_user.taxId": taxId };
    const v = await Reward.aggregate([
      {
        $lookup: {
          from: "rrs_codes",
          localField: "rrsCodeId",
          foreignField: "_id",
          as: "reward_rrs_code",
        },
      },
      {
        $match: reward_where,
      },
      { $unwind: "$reward_rrs_code" },
      {
        $lookup: {
          from: "users",
          localField: "reward_rrs_code.userId",
          foreignField: "_id",
          as: "rrs_code_user",
        },
      },
      {
        $match: rrs_code_where,
      },
      { $unwind: "$rrs_code_user" },
      {
        $project: {
          rewardData: 0,
          __v: 0,
          "reward_rrs_code.rrsCodeData": 0,
          "reward_rrs_code._id": 0,
          "reward_rrs_code.__v": 0,
          rrs_code_user: 0,
        },
      },
    ]);
    return v;
  },

  /**
   * admin module
   */
  getTopMonthlyHighestReceipts: async (data) => {
    const { receipt_where, limit } = data;
    const v = await Receipt.aggregate([
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
      { $sort: { receiptAmount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          receiptData: 0,
          "receipt_rrs_code.rrsCodeData": 0,
          receipts: 0,
          "rrs_code_user.userData": 0,
          "rrs_code_user.password": 0,
        },
      },
    ]);
    return v;
  },

  getTopMonthlyLeastReceipts: async (data) => {
    const { receipt_where, limit } = data;
    const v = await Receipt.aggregate([
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
      { $sort: { receiptAmount: 1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          receiptData: 0,
          "receipt_rrs_code.rrsCodeData": 0,
          receipts: 0,
          "rrs_code_user.userData": 0,
          "rrs_code_user.password": 0,
        },
      },
    ]);
    return v;
  },

  getMonthlyReceiptsAggregate: async (data) => {
    const { receipt_where } = data;
    const v = await Receipt.aggregate([
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
        $group: {
          _id: {
            month: "$receipt_rrs_code.rrsCodeMonth",
            year: "$receipt_rrs_code.rrsCodeYear",
          },
          total: { $sum: "$receiptAmount" },
          count: { $sum: 1 },
        },
      },
    ]);
    return v;
  },

  getMonthlyRrsReceiptsAggregate: async (data) => {
    const { receipt_where } = data;
    const v = await Receipt.aggregate([
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
        $group: {
          _id: {
            rrsCode: "$receipt_rrs_code.rrsCode",
            month: "$receipt_rrs_code.rrsCodeMonth",
            year: "$receipt_rrs_code.rrsCodeYear",
          },
          total: { $sum: "$receiptAmount" },
          count: { $sum: 1 },
        },
      },
    ]);
    return v;
  },

  /* getMonthlyReceiptCount: async (data) => {
    const { month, year } = data;
    let receipt_where = {
      "receipt_rrs_code.rrsCodeStatus": 1,
      "receipt_rrs_code.rrsCodeMonth": month,
      "receipt_rrs_code.rrsCodeYear": year,
    };
    const v = await Receipt.aggregate([
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
        $count: "count",
      },
    ]);
    return v;
  }, */

  getMonthlyRrsCodesCount: async (data) => {
    const { month, year } = data;
    let rrs_code_where = {
      rrsCodeMonth: month,
      rrsCodeYear: year,
    };
    const countQuery = RrsCode.where(rrs_code_where).countDocuments();
    return countQuery;
  },

  getTotalUserCount: async () => {
    const countQuery = User.find({ isAdmin: 0 }).countDocuments();
    return countQuery;
  },

  getMonthlyRrsCodes: async (params) => {
    const { month, year, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    let rrs_code_where = {
      rrsCodeMonth: month,
      rrsCodeYear: year,
      rrsCodeStatus: 1,
    };
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
      { $sort: { createdAt: -1 } },
      {
        $project: {
          rrsCodeData: 0,
          //rrs_code_user: 0,
          receipts: 0,
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

  adminTopMonthReceipts: async (params) => {
    const { month, year, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    let receipt_where = {
      "receipt_rrs_code.rrsCodeStatus": 1,
      "receipt_rrs_code.rrsCodeMonth": month,
      "receipt_rrs_code.rrsCodeYear": year,
    };
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
      { $sort: { receiptAmount: -1 } },
      {
        $project: {
          receiptData: 0,
          __v: 0,
          "receipt_rrs_code.rrsCodeData": 0,
          "receipt_rrs_code._id": 0,
          "receipt_rrs_code.__v": 0,
          "receipt_rrs_code.receipts": 0,
          "rrs_code_user.userData": 0,
          "rrs_code_user.password": 0,
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
      receiptAmountDisplay: {
        $function: {
          body: function (receiptAmount) {
            return receiptAmount
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          },
          args: ["$receiptAmount"],
          lang: "js",
        },
      },
    });
    const result = Receipt.aggregatePaginate(
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