
const fs = require("fs");
const _ = require("lodash");
const generator = require("generate-password");
const moment = require("moment");
const strings = require("locutus/php/strings");
const UserMenu = require("../../models/UserMenu");
const InstitutionMenu = require("../../models/InstitutionMenu");
const SystemMenu = require("../../models/SystemMenu");
const DeletedData = require("../../models/DeletedData");
const utils = require("..");
const number_format = require("locutus/php/strings/number_format");
const time = new Date(Date.now()).toLocaleString();

module.exports = {

  createSystemMenu: async (data) => {
    return SystemMenu.create(data);
  },

  createInstitutionMenu: async (data) => {
    return InstitutionMenu.create(data);
  },

  getSystemMenu: async (data) => {
    return SystemMenu.find(data);
  },

  getInstitutionMenu: async (data) => {
    return InstitutionMenu.find(data).populate({path: 'systemMenuId'});
  },

  createUserMenu: async (data) => {
    const del = await UserMenu.deleteMany({ userId: data.userId, institutionId: data.institutionId });
    console.log(del.deletedCount)
    return data.userMenuData ? UserMenu.insertMany(data.userMenuData) : false;
  },

  getUserMenu: async (data) => {
    return UserMenu.find(data).select('title icon target route href children -_id');
  },


  /*updateUser: async ({ filter: filter, update: update, options: options }) => {
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
  },*/



  /*getUserMenu: async (data) => {
    const v = await UserMenu.find(data).
    populate({ path: 'userId', select: 'phone email'}).
    populate({ path: 'institutionMenuId',
      populate: [
        { path: 'systemMenuId' }
      ] });
    let menuArr = [];
    _.forEach(v, async (u) => {
      if (u) {
        let obj = {

        }
        console.log("**** starting u ***")
        console.log(u.institutionId)
        console.log("**** ending u ***")
        menuArr.push(u);
      }
    });
    return menuArr;
  },*/

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
          __v: 0,
          userData: 0,
          passwordResets: 0,
          password: 0,
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
            return isSystemAdmin == 1 ? "Yes" : "No";
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

};