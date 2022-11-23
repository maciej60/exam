const fs = require("fs");
const _ = require("lodash");
const generator = require("generate-password");
const moment = require("moment");
const strings = require("locutus/php/strings");
const Application = require("../../models/Application");
const ApplicationStage = require("../../models/ApplicationStage");
const ApplicationUserPermission = require("../../models/ApplicationUserPermission");
const User = require("../../models/User");
const utils = require("../");
const {is_null} = require("locutus/php/var");
const time = new Date(Date.now()).toLocaleString();

module.exports = {

  /**
   * application
   * @param data
   * @returns {Promise<data>}
   */
  createApplication: async (data) => {
    return Application.create(data);
  },

  getApplications: async (params) => {
    const { where, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    const v = Application.aggregate([
      {
        $match: where,
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "institutions",
          localField: "institutionId",
          foreignField: "_id",
          as: "application_institution",
        },
      },
      { $unwind: "$application_institution" },
      {
        $lookup: {
          from: "businesses",
          localField: "application_institution.businessId",
          foreignField: "_id",
          as: "institution_business",
        },
      },
      { $unwind: "$institution_business" },
      {
        $project: {
          __v: 0,
          status: 0,
          "application_institution.address": 0,
          "application_institution._id": 0,
          "institution_business.address": 0,
          "institution_business._id": 0,
        },
      },
    ]);
    return Application.aggregatePaginate(v, options, function (err, results) {
      if (err) {
        console.log(err);
      } else {
        return results;
      }
    });
  },

  getApplication: async (where) => {
    return Application.find(where).populate({path: 'institutionId'});
  },

  findUpdate: async ({
                       filter: filter,
                       update: update,
                       options: options,
                     }) => {
    let res;
    let result;
    let check = await Application.findOne(filter);
    if (!check || is_null(check)) {
      return {result: false, message: "Application provided do not exist"};
    } else {
      res = await Application.findOneAndUpdate(filter, update, options);
    }
    result = res.toObject();
    if (result) {
      result.id = result._id;
    }
    return { result, message: "successful" };
  },

  /**
   * application stage
   */

  createApplicationStage: async (data) => {
    return ApplicationStage.create(data);
  },

  findUpdateStage: async ({
                       filter: filter,
                       update: update,
                       options: options,
                     }) => {
    let res;
    let result;
    let check = await ApplicationStage.findOne(filter);
    if (!check || is_null(check)) {
      return {result: false, message: "Application stage provided do not exist"};
    } else {
      res = await ApplicationStage.findOneAndUpdate(filter, update, options);
    }
    result = res.toObject();
    if (result) {
      result.id = result._id;
    }
    return { result, message: "successful" };
  },

  getApplicationStages: async (params) => {
    const { where, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    const v = ApplicationStage.aggregate([
      {
        $match: where,
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "applications",
          localField: "applicationId",
          foreignField: "_id",
          as: "stage_application",
        },
      },
      { $unwind: "$stage_application" },
      {
        $lookup: {
          from: "institutions",
          localField: "stage_application.institutionId",
          foreignField: "_id",
          as: "stage_application_institution",
        },
      },
      { $unwind: "$stage_application_institution" },
      {
        $lookup: {
          from: "businesses",
          localField: "stage_application_institution.businessId",
          foreignField: "_id",
          as: "stage_institution_business",
        },
      },
      { $unwind: "$stage_institution_business" },
      {
        $project: {
          __v: 0,
          status: 0,
          applicationId: 0,
          institutionId: 0,
          "stage_application_institution.address": 0,
          "stage_application_institution._id": 0,
          "stage_application_institution.createdAt": 0,
          "stage_application_institution.updatedAt": 0,
          "stage_application_institution.businessId": 0,
          "stage_application_institution.modules": 0,
          "stage_institution_business.address": 0,
          "stage_institution_business._id": 0,
          "stage_institution_business.createdAt": 0,
          "stage_institution_business.updatedAt": 0,
        },
      },
    ]);
    return ApplicationStage.aggregatePaginate(v, options, function (err, results) {
      if (err) {
        console.log(err);
      } else {
        return results;
      }
    });
  },

  createApplicationUserPermission: async (data) => {
    return ApplicationUserPermission.create(data);
  },

  findUpdateUserPermission: async ({
                            filter: filter,
                            update: update,
                            options: options,
                          }) => {
    let res;
    let result;
    let check = await ApplicationUserPermission.findOne(filter);
    if (!check || is_null(check)) {
      return {result: false, message: "Application user permission provided do not exist"};
    } else {
      res = await ApplicationUserPermission.findOneAndUpdate(filter, update, options);
    }
    result = res.toObject();
    if (result) {
      result.id = result._id;
    }
    return { result, message: "successful" };
  },

  getApplicationUserPermissions: async (params) => {
    const { where, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    const v = ApplicationUserPermission.aggregate([
      {
        $match: where,
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "applications",
          localField: "applicationId",
          foreignField: "_id",
          as: "permission_application",
        },
      },
      { $unwind: "$permission_application" },
      {
        $lookup: {
          from: "institutions",
          localField: "institutionId",
          foreignField: "_id",
          as: "permission_institution",
        },
      },
      { $unwind: "$permission_institution" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "permission_user",
        },
      },
      { $unwind: "$permission_user" },
      {
        $lookup: {
          from: "application_stages",
          localField: "applicationStageId",
          foreignField: "_id",
          as: "permission_application_stage",
        },
      },
      { $unwind: "$permission_application_stage" },
      {
        $project: {
          __v: 0,
          status: 0,
          applicationId: 0,
          institutionId: 0,
          userId: 0,
          applicationStageId: 0,
          "permission_application.createdAt": 0,
          "permission_application.updatedAt": 0,
          "permission_application._id": 0,
          "permission_institution.address": 0,
          "permission_institution._id": 0,
          "permission_institution.createdAt": 0,
          "permission_institution.updatedAt": 0,
          "permission_institution.businessId": 0,
          "permission_institution.modules": 0,
          "permission_user.password": 0,
          "permission_user._id": 0,
          "permission_user.firstLogin": 0,
          "permission_user.passwordResets": 0,
          "permission_user.updatedAt": 0,
          "permission_user.createdAt": 0,
          "permission_application_stage.createdAt": 0,
          "permission_application_stage.updatedAt": 0,
        },
      },
    ]);
    return ApplicationUserPermission.aggregatePaginate(v, options, function (err, results) {
      if (err) {
        console.log(err);
      } else {
        return results;
      }
    });
  },







};