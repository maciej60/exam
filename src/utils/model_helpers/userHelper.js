
const fs = require("fs");
const _ = require("lodash");
const generator = require("generate-password");
const moment = require("moment");
const strings = require("locutus/php/strings");
const User = require("../../models/User");
const DeletedData = require("../../models/DeletedData");
const utils = require("..");
const number_format = require("locutus/php/strings/number_format");
const time = new Date(Date.now()).toLocaleString();

module.exports = {

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
      /*userTypeText: {
        $function: {
          body: function (userType) {
            return userType == 1 ? "Individual" : "Company";
          },
          args: ["$userType"],
          lang: "js",
        },
      },*/
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

  /**
   * admin module
   */

  getTotalUserCount: async () => {
    const countQuery = User.find({ isAdmin: 0 }).countDocuments();
    return countQuery;
  },

};