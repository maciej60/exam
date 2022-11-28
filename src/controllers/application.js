const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const utils = require("../utils");
const helper = require("../utils/model_helpers");
const _ = require("lodash");
const logger = require("../utils/logger");
const { parseInt } = require("lodash");
const time = new Date(Date.now()).toLocaleString();
const Joi = require("joi");
const communication = require("./communication");
const next = require("locutus/php/array/next");
const generator = require("generate-password");
require("dotenv").config();
let appRoot = require("app-root-path");
let emailTemplate = require(`${appRoot}/src/utils/emailTemplate`);

let subjectPascal = "Application";
let subjectContainer = "applicationData";
let subjectHelperCreate = helper.ApplicationHelper.createApplication;
let subjectHelperGet = helper.ApplicationHelper.getApplications;
let subjectHelperUpdate = helper.ApplicationHelper.findUpdate;


/**
 * @desc Application
 * @route POST /api/v2/application/add
 * @access PUBLIC
 */
exports.add = asyncHandler(async (req, res, next) => {
  let  validationSchema;
  try {
    /**
     * validate request body
     * @type {Joi.ObjectSchema<any>}
     */
    validationSchema = Joi.object({
      name: Joi.string().min(5).max(50).required(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      institutionId: Joi.string(),
      documentsRequired: Joi.any(),
    });
    const { error } = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} create validation failed with error: ${error.details[0].message}`,
        errorCode: "APP01",
        statusCode: 406
      });
    let createdBy = req.user.id || null;
    let {name, startDate, endDate, institutionId, documentsRequired} = req.body;
    const ObjectId = require("mongoose").Types.ObjectId;
    subjectContainer = {
      name,
      startDate,
      endDate,
      createdBy,
      institutionId,
      documentsRequired
    };
    const create = await subjectHelperCreate(subjectContainer);

    await logger.filecheck(
        `INFO: ${subjectPascal}: ${name} created at ${time} with data ${JSON.stringify(
            create
        )} \n`
    );
    return utils.send_json_response({
      res,
      data: create,
      msg: `${subjectPascal} successfully created.`,
      statusCode: 201
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} create failed with error ${error.message}`,
      errorCode: "APP02",
      statusCode: 500
    });
  }
});

/**
 * @desc Application
 * @route GET /api/v2/application/list
 * @access Application
 */
exports.list = asyncHandler(async (req, res, next) => {
  try{
    let createdBy = req.user.id;
    /**
     * build query options for mongoose-paginate
     */
    const queryOptions = await utils.buildQueryOptions(req.query);
    if (typeof queryOptions === "string") {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${queryOptions} is not valid!`,
        errorCode: "APP03",
        statusCode: 400
      });
    }
    /**
     * fetch paginated data using queryOptions
     */
    const ObjectId = require("mongoose").Types.ObjectId;
    let where = {};
    if (!_.isEmpty(req.body.institutionId) && req.body.institutionId) {
      where.institutionId = new ObjectId(req.body.institutionId);
    }
    if (!_.isEmpty(req.body.name) && req.body.name) {
      where.name = {
        $regex: ".*" + req.body.name + ".*",
        $options: "i",
      };
    }
    if (!_.isEmpty(req.body.dateTo) && req.body.dateTo && !_.isEmpty(req.body.dateFrom) && req.body.dateFrom) {
      where.startDate = {
        $gte: new Date(req.body.dateFrom),
        $lte: new Date(req.body.dateTo),
      };
    }
    const objWithoutMeta = await subjectHelperGet({
      where,
      queryOptions,
    });
    if (objWithoutMeta.data && !_.isEmpty(objWithoutMeta.data)) {
      /**
       * build response data meta for pagination
       */
      let url = req.protocol + "://" + req.get("host") + req.originalUrl;
      const obj = await utils.buildResponseMeta({ url, obj: objWithoutMeta });
      await logger.filecheck(
          `INFO: ${subjectPascal} list by: ${createdBy}, at ${time} with data ${JSON.stringify(
              obj
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: `${subjectPascal} list successfully fetched`,
        statusCode: 200
      });
    } else {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `No record!`,
        errorCode: "APP04",
        statusCode: 404
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} list failed with error ${error.message}`,
      errorCode: "APP05",
      statusCode: 505
    });
  }
});

/**
 * @desc Application
 * @route POST /api/v2/application/update
 * @access PUBLIC
 */
exports.update = asyncHandler(async (req, res) => {
  let createdBy = req.user.id;
  let validationSchema;
  try {
    validationSchema = Joi.object({
      name: Joi.string().min(5).max(50).required(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      documentsRequired: Joi.any(),
      id: Joi.string()
    });
    const { error } = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} update validation failed with error: ${error.details[0].message}`,
        errorCode: "APP06",
        statusCode: 406
      });
    const {name, startDate, endDate, documentsRequired, id} = req.body;
    const data = {name, startDate, endDate, documentsRequired};
    const ObjectId = require("mongoose").Types.ObjectId;
    const update = await subjectHelperUpdate({
      filter: {
        _id: new ObjectId(id),
      },
      update: {
        $set: data,
      },
      options: { upsert: true, new: true },
    });
    if (!update.result)
      return utils.send_json_error_response({
        res,
        data: update.result,
        msg: update.message,
        errorCode: "APP07",
        statusCode: 502
      });
    return utils.send_json_response({
      res,
      data: update.result,
      statusCode: 201
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `Error: ${error} `,
      errorCode: "APP08",
      statusCode: 500
    });
  }
});

/**
 * @desc Application
 * @route POST /api/v2/application/delete
 * @access PUBLIC
 */
exports.remove = asyncHandler(async (req, res, next) => {
  try {
    let deletedBy = req.user.id;
    let { ids } = req.body;
    let model = subjectPascal;
    const ObjectId = require("mongoose").Types.ObjectId;
    ids.map((d) => new ObjectId(d));
    let del = await helper.backupAndDelete({
      ids,
      deletedBy,
      model,
    });
    if(del.deletedCount >= 1){
      await logger.filecheck(
          `INFO: ${subjectPascal} deleted: by ${deletedBy} at ${time} with data ${JSON.stringify(
              del
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: del,
        msg: `${subjectPascal} successfully deleted`,
        statusCode: 200
      });
    }else{
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} delete failed`,
        errorCode: "APP08",
        statusCode: 502
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} delete failed with error ${error.message}`,
      errorCode: "APP09",
      statusCode: 500
    });
  }
});

/**
 * @desc ApplicationStage
 * @route POST /api/v2/application/addStage
 * @access PUBLIC
 */
exports.addStage = asyncHandler(async (req, res, next) => {
  let  validationSchema;
  try {
    /**
     * validate request body
     * @type {Joi.ObjectSchema<any>}
     */
    validationSchema = Joi.object({
      name: Joi.string().min(5).max(50).required(),
      sequence: Joi.number(),
      applicationId: Joi.any(),
      institutionId: Joi.any(),
    });
    const { error } = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: error,
        msg: `${subjectPascal} stage validation failed with error: ${error.details[0].message}`,
        errorCode: "APP10",
        statusCode: 406
      });
    let createdBy = req.user.id || null;
    let {name, sequence, applicationId, institutionId} = req.body;
    const ObjectId = require("mongoose").Types.ObjectId;
    subjectContainer = {
      name,
      sequence,
      applicationId,
      createdBy,
      institutionId,
    };
    const create = await helper.ApplicationHelper.createApplicationStage(subjectContainer);
    if(!create)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} stage create failed`,
        errorCode: "APP11",
        statusCode: 502
      });
    await logger.filecheck(
        `INFO: ${subjectPascal} stage: ${name} created at ${time} with data ${JSON.stringify(
            create
        )} \n`
    );
    return utils.send_json_response({
      res,
      data: create,
      msg: `${subjectPascal} stage successfully created.`,
      statusCode: 201
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} stage create failed with error ${error.message}`,
      errorCode: "APP13",
      statusCode: 500
    });
  }
});

/**
 * @desc ApplicationStage
 * @route POST /api/v2/application/updateStage
 * @access PUBLIC
 */
exports.updateStage = asyncHandler(async (req, res) => {
  let createdBy = req.user.id;
  let validationSchema;
  try {
    validationSchema = Joi.object({
      name: Joi.string().min(5).max(50).required(),
      sequence: Joi.number(),
      id: Joi.string()
    });
    const { error } = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} stage update validation failed with error: ${error.details[0].message}`,
        errorCode: "APP14",
        statusCode: 406
      });
    const {name, sequence, id} = req.body;
    const data = {name, sequence};
    const ObjectId = require("mongoose").Types.ObjectId;
    const update = await helper.ApplicationHelper.findUpdateStage({
      filter: {
        _id: new ObjectId(id),
      },
      update: {
        $set: data,
      },
      options: { upsert: true, new: true },
    });
    if (!update.result)
      return utils.send_json_error_response({
        res,
        data: update.result,
        msg: update.message,
        errorCode: "APP15",
        statusCode: 502
      });
    return utils.send_json_response({
      res,
      data: update.result,
      msg: `${subjectPascal} stage successfully updated.`,
      statusCode: 201
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `Error: ${error} `,
      errorCode: "APP16",
      statusCode: 500
    });
  }
});

/**
 * @desc ApplicationStage
 * @route POST /api/v2/application/removeStage
 * @access PUBLIC
 */
exports.removeStage = asyncHandler(async (req, res, next) => {
  try {
    let deletedBy = req.user.id;
    let { ids } = req.body;
    let model = "ApplicationStage";
    const ObjectId = require("mongoose").Types.ObjectId;
    ids.map((d) => new ObjectId(d));
    let del = await helper.backupAndDelete({
      ids,
      deletedBy,
      model,
    });
    if(del.deletedCount >= 1){
      await logger.filecheck(
          `INFO: ${subjectPascal} stage deleted: by ${deletedBy} at ${time} with data ${JSON.stringify(
              del
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: del,
        msg: `${subjectPascal} stage successfully deleted`,
        statusCode: 200
      });
    }else{
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} stage delete failed`,
        errorCode: "APP17",
        statusCode: 502
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} stage delete failed with error ${error.message}`,
      errorCode: "APP18",
      statusCode: 500
    });
  }
});


/**
 * @desc ApplicationStage
 * @route GET /api/v2/application/listStage
 * @access ApplicationStage
 */
exports.listStage = asyncHandler(async (req, res, next) => {
  try{
    let createdBy = req.user.id;
    /**
     * build query options for mongoose-paginate
     */
    const queryOptions = await utils.buildQueryOptions(req.query);

    if (typeof queryOptions === "string") {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${queryOptions} is not valid!`,
        errorCode: "APP19",
        statusCode: 400
      });
    }
    /**
     * fetch paginated data using queryOptions
     */
    const ObjectId = require("mongoose").Types.ObjectId;
    let where = {};
    if (!_.isEmpty(req.body.institutionId) && req.body.institutionId) {
      where.institutionId = new ObjectId(req.body.institutionId);
    }
    if (!_.isEmpty(req.body.applicationId) && req.body.applicationId) {
      where.applicationId = new ObjectId(req.body.applicationId);
    }
    if (!_.isEmpty(req.body.name) && req.body.name) {
      where.name = {
        $regex: ".*" + req.body.name + ".*",
        $options: "i",
      };
    }
    const objWithoutMeta = await helper.ApplicationHelper.getApplicationStages({
      where,
      queryOptions,
    });
    if (objWithoutMeta.data && !_.isEmpty(objWithoutMeta.data)) {
      /**
       * build response data meta for pagination
       */
      let url = req.protocol + "://" + req.get("host") + req.originalUrl;
      const obj = await utils.buildResponseMeta({ url, obj: objWithoutMeta });
      await logger.filecheck(
          `INFO: ${subjectPascal} stage list by: ${createdBy}, at ${time} with data ${JSON.stringify(
              obj
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: `${subjectPascal} stage list successfully fetched`,
        statusCode: 200
      });
    } else {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `No record!`,
        errorCode: "APP20",
        statusCode: 404
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} stage list failed with error ${error.message}`,
      errorCode: "APP21",
      statusCode: 500
    });
  }
});

/**
 * application user permission
 */

/**
 * @desc ApplicationUserPermission
 * @route POST /api/v2/application/addPermission
 * @access PUBLIC
 */
exports.addPermission = asyncHandler(async (req, res, next) => {
  let  validationSchema;
  try {
    /**
     * validate request body
     * @type {Joi.ObjectSchema<any>}
     */
    validationSchema = Joi.object({
      permission: Joi.any(),
      stageLevel: Joi.number(),
      userId: Joi.any(),
      institutionId: Joi.any(),
      applicationId: Joi.any(),
      applicationStageId: Joi.any()
    });
    const { error } = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: error,
        msg: `${subjectPascal} user permission validation failed with error: ${error.details[0].message}`,
        errorCode: "APP22",
        statusCode: 406
      });
    let createdBy = req.user.id || null;
    let {permission, stageLevel, userId, applicationId, institutionId, applicationStageId} = req.body;
    const ObjectId = require("mongoose").Types.ObjectId;
    subjectContainer = {
      permission,
      stageLevel,
      userId,
      applicationId,
      applicationStageId,
      createdBy,
      institutionId,
    };
    const create = await helper.ApplicationHelper.createApplicationUserPermission(subjectContainer);
    if(!create)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} user permission create failed`,
        errorCode: "APP23",
        statusCode: 502
      });
    await logger.filecheck(
        `INFO: ${subjectPascal} user permission  created at ${time} with data ${JSON.stringify(
            create
        )} \n`
    );
    return utils.send_json_response({
      res,
      data: create,
      msg: `${subjectPascal} user permission successfully created.`,
      statusCode: 201
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} user permission create failed with error ${error.message}`,
      errorCode: "APP24",
      statusCode: 500
    });
  }
});

/**
 * @desc ApplicationUserPermission
 * @route POST /api/v2/application/updatePermission
 * @access PUBLIC
 */
exports.updatePermission = asyncHandler(async (req, res) => {
  let createdBy = req.user.id;
  let validationSchema;
  try {
    validationSchema = Joi.object({
      permission: Joi.any(),
      stageLevel: Joi.number(),
      id: Joi.string()
    });
    const { error } = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} user permission update validation failed with error: ${error.details[0].message}`,
        errorCode: "APP25",
        statusCode: 406
      });
    const {permission, stageLevel, id} = req.body;
    const data = {permission, stageLevel};
    const ObjectId = require("mongoose").Types.ObjectId;
    const update = await helper.ApplicationHelper.findUpdateUserPermission({
      filter: {
        _id: new ObjectId(id),
      },
      update: {
        $set: data,
      },
      options: { upsert: true, new: true },
    });
    if (!update.result)
      return utils.send_json_error_response({
        res,
        data: update.result,
        msg: update.message,
        errorCode: "APP26",
        statusCode: 502
      });
    return utils.send_json_response({
      res,
      data: update.result,
      msg: `${subjectPascal} user permission successfully updated.`,
      statusCode: 201
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `Error: ${error} `,
      errorCode: "APP27",
      statusCode: 500
    });
  }
});

/**
 * @desc ApplicationUserPermission
 * @route POST /api/v2/application/removePermission
 * @access PUBLIC
 */
exports.removePermission = asyncHandler(async (req, res, next) => {
  try {
    let deletedBy = req.user.id;
    let { ids } = req.body;
    let model = "ApplicationUserPermission";
    const ObjectId = require("mongoose").Types.ObjectId;
    ids.map((d) => new ObjectId(d));
    let del = await helper.backupAndDelete({
      ids,
      deletedBy,
      model,
    });
    if(del.deletedCount >= 1){
      await logger.filecheck(
          `INFO: ${subjectPascal} user permission deleted: by ${deletedBy} at ${time} with data ${JSON.stringify(
              del
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: del,
        msg: `${subjectPascal} user permission successfully deleted`,
        statusCode: 200
      });
    }else{
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} user permission delete failed`,
        errorCode: "APP28",
        statusCode: 502
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} user permission delete failed with error ${error.message}`,
      errorCode: "APP29",
      statusCode: 500
    });
  }
});

/**
 * @desc ApplicationUserPermission
 * @route GET /api/v2/application/listPermission
 * @access ApplicationUserPermission
 */
exports.listPermission = asyncHandler(async (req, res, next) => {
  try {
    let createdBy = req.user.id;
    if (_.isEmpty(req.query)) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Provide query params like sort, page and per_page!`,
        errorCode: "APP30",
        statusCode: 400
      });
    }
    /**
     * build query options for mongoose-paginate
     */
    const queryOptions = await utils.buildQueryOptions(req.query);
    if (typeof queryOptions === "string") {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${queryOptions} is not valid!`,
        errorCode: "APP31",
        statusCode: 400
      });
    }
    /**
     * fetch paginated data using queryOptions
     */
    const ObjectId = require("mongoose").Types.ObjectId;
    let where = {};
    // use this for fields that has boolean values or 1 and 0
    if (req.body.hasOwnProperty("stageLevel")) {
      where.stageLevel = parseInt(req.body.stageLevel);
    }
    if (!_.isEmpty(req.body.institutionId) && req.body.institutionId) {
      where.institutionId = new ObjectId(req.body.institutionId);
    }
    if (!_.isEmpty(req.body.applicationId) && req.body.applicationId) {
      where.applicationId = new ObjectId(req.body.applicationId);
    }
    if (!_.isEmpty(req.body.applicationStageId) && req.body.applicationStageId) {
      where.applicationStageId = new ObjectId(req.body.applicationStageId);
    }
    if (!_.isEmpty(req.body.userId) && req.body.userId) {
      where.userId = new ObjectId(req.body.userId);
    }
    const objWithoutMeta = await helper.ApplicationHelper.getApplicationUserPermissions({
      where,
      queryOptions,
    });
    if (objWithoutMeta.data && !_.isEmpty(objWithoutMeta.data)) {
      /**
       * build response data meta for pagination
       */
      let url = req.protocol + "://" + req.get("host") + req.originalUrl;
      const obj = await utils.buildResponseMeta({url, obj: objWithoutMeta});
      await logger.filecheck(
          `INFO: ${subjectPascal} user permission list by: ${createdBy}, at ${time} with data ${JSON.stringify(
              obj
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: `${subjectPascal} user permission list successfully fetched`,
        statusCode: 200
      });
    } else {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `No record!`,
        errorCode: "APP32",
        statusCode: 404
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} user permission list failed with error ${error.message}`,
      errorCode: "APP33",
      statusCode: 500
    });
  }
});

/**
* @desc ApplicationUserPermission
* @route GET /api/v2/application/listPermission
* @access ApplicationUserPermission
*/
exports.test = asyncHandler(async (req, res, next) => {
  try {
    let createdBy = req.user.id;
    if (_.isEmpty(req.query)) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Provide query params like sort, page and per_page!`,
        errorCode: "APP34",
        statusCode: 400
      });
    }
    let where = [];
    if (!_.isEmpty(req.query.iCode) && req.query.iCode) {
      where["institution_where"]["permission_institution.institutionCode"] = req.query.iCode;
    }
    if (!_.isEmpty(req.query.uEmail) && req.query.uEmail) {
      where["institution_where"]["permission_user.email"] = req.query.uEmail;
    }
    if (!_.isEmpty(req.query.uPhone) && req.query.uPhone) {
      where["institution_where"]["permission_user.phone"] = req.query.uPhone;
    }
    if (!_.isEmpty(req.query.aStage) && req.query.aStage) {
      where["institution_where"]["permission_application_stage.name"] = req.query.aStage;
    }
    if (!_.isEmpty(req.query.iName) && req.query.iName) {
      where["institution_where"]["permission_institution.name"] = {
        $regex: ".*" + req.query.iName + ".*",
        $options: "i",
      };
    }
    console.log(req.query.aName)
    if (!_.isEmpty(req.query.aName) && req.query.aName) {
      where["institution_where"]["permission_application.name"] = {
        $regex: ".*" + req.query.aName + ".*",
        $options: "i",
      };
    }
    if (
        !_.isEmpty(req.query.aDateFrom) &&
        req.query.aDateFrom &&
        !_.isEmpty(req.query.aDateTo) &&
        req.query.aDateTo
    ) {
      where["institution_where"]["permission_application.startDate"] = {
        $gte: new Date(req.query.aDateFrom),
        $lte: new Date(req.query.aDateTo),
      };
    }
    console.log(where)
    /**
     * build query options for mongoose-paginate
     */
    const queryOptions = await utils.buildQueryOptions(req.query);

    if (typeof queryOptions === "string") {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${queryOptions} is not valid!`,
        errorCode: "APP35",
        statusCode: 400
      });
    }
    /**
     * fetch paginated data using queryOptions
     */
    const objWithoutMeta = await helper.ApplicationHelper.getApplicationUserPermissions({
      where,
      queryOptions,
    });
    if (objWithoutMeta.data && !_.isEmpty(objWithoutMeta.data)) {
      /**
       * build response data meta for pagination
       */
      let url = req.protocol + "://" + req.get("host") + req.originalUrl;
      const obj = await utils.buildResponseMeta({url, obj: objWithoutMeta});
      await logger.filecheck(
          `INFO: ${subjectPascal} user permission list by: ${createdBy}, at ${time} with data ${JSON.stringify(
              obj
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: `${subjectPascal} user permission list successfully fetched`,
        statusCode: 200
      });
    } else {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `No record!`,
        errorCode: "APP36",
        statusCode: 404
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} user permission list failed with error ${error.message}`,
      errorCode: "APP37",
      statusCode: 500
    });
  }
});

