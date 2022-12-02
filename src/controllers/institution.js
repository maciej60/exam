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
const Institution = require("../models/Institution");
require("dotenv").config();
let appRoot = require("app-root-path");
let emailTemplate = require(`${appRoot}/src/utils/emailTemplate`);
const path = require("path");

let subjectPascal = "Institution";
let subjectCamel = "institution";
let subjectSmall = "institution";
let subjectContainer = "institutionData";
let subjectHelperCreate = helper.InstitutionHelper.createInstitution;
let subjectHelperGet = helper.InstitutionHelper.getInstitutions;
let subjectHelperUpdate = helper.InstitutionHelper.findUpdate;


/**
 * @desc Institution
 * @route POST /api/v2/institution/add
 * @access PUBLIC
 * @param ?e00987TE4=code this contains the institutionCode for creating admin
 */
exports.add = asyncHandler(async (req, res, next) => {
  let sender, createdBy;
  let validationSchema;
  try {
    /**
     * validate request body
     * @type {Joi.ObjectSchema<any>}
     */
    validationSchema = Joi.object({
      name: Joi.string().min(5).max(50).required(),
      phone: Joi.string().min(11).max(15),
      email: Joi.string().min(5).max(50).email().required(),
      address: Joi.string().min(10).max(100).required(),
      businessId: Joi.string(),
      logo: Joi.string(),
      institutionConfig: Joi.object(),
      modules: Joi.any(),
      admin_url: Joi.string()
    });
    const {error} = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} create validation failed with error: ${error.details[0].message}`,
        errorCode: "INS01",
        statusCode: 406
      });
    if(req.user) createdBy = req.user.id || null;
    let {name, phone, email, address, businessId, logo, modules, admin_url} = req.body;
    const ObjectId = require("mongoose").Types.ObjectId;
    let subjectContainer = {
      name,
      phone,
      email,
      address,
      institutionCode: await helper.InstitutionHelper.generateInstitutionCode(),
      createdBy,
      businessId,
      logo,
      modules
    };
    const create = await subjectHelperCreate(subjectContainer);
    let instManagerCreate_URL = admin_url + "?e00987TE4=" + create.institutionCode;

    console.log(`*** begin email sending ***`);
    let subject = "Institution Admin Creation";
    let emailParams = {
      heading: `"Institution Created"`,
      previewText:
          "Exam Portal is awesome!",
      message:
          `welcome to ${process.env.APP_NAME}, your institution code is: ${create.institutionCode}. kindly click on the link below to create an institution manager. ${instManagerCreate_URL}`,
      url: instManagerCreate_URL,
      url_text: "Create Admin",
    };
    let template = emailTemplate.forgotPassword(emailParams);
    let p = {
      to: email,
      message: template,
      subject,
    };
    let success;
    sender = await utils.send_email_api(p);
    if (sender.response.Code === "02") {
      success = 1;
    }
    let email_log_data = {
      email,
      requestData: sender.request,
      responseData: sender.response,
      emailLogStatus: success,
    };
    await helper.EmailLogHelper.createEmailLog(
        email_log_data
    );
    console.log(`*** emailLog created ***`);

    await logger.filecheck(
        `INFO: ${subjectPascal}: ${name} created at ${time} with data ${JSON.stringify(
            create
        )} \n`
    );
    return utils.send_json_response({
      res,
      data: create,
      msg: `${subjectPascal} successfully created, check your mail to create an institution manager.`,
      statusCode: 201
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} create failed with error ${error.message}`,
      errorCode: "INS02",
      statusCode: 500
    });
  }
});

/**
 * @desc Institution
 * @route GET /api/v2/institution/list
 * @access Institution Admin
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
        errorCode: "INS03",
        statusCode: 400
      });
    }
    /**
     * fetch paginated data using queryOptions
     */
    const ObjectId = require("mongoose").Types.ObjectId;
    let where = {};
    if (!_.isEmpty(req.body.name) && req.body.name) {
      where.name = {
        $regex: ".*" + req.body.name + ".*",
        $options: "i",
      };
    }
    if (!_.isEmpty(req.body.institutionCode) && req.body.institutionCode) {
      where.institutionCode = (req.body.institutionCode);
    }
    if (!_.isEmpty(req.body.email) && req.body.email) {
      where.email = (req.body.email);
    }
    if (!_.isEmpty(req.body.phone) && req.body.phone) {
      where.phone = (req.body.phone);
    }
    const objWithoutMeta = await helper.InstitutionHelper.getInstitutions({
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
        errorCode: "INS03",
        statusCode: 404
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} list failed with error ${error.message}`,
      errorCode: "INS05",
      statusCode: 500
    });
  }
});

/**
 * @desc Institution
 * @route POST /api/v2/institution/update
 * @access PUBLIC
 */
exports.update = asyncHandler(async (req, res) => {
  let createdBy = req.user.id;
  let validationSchema;
  try {
    validationSchema = Joi.object({
      name: Joi.string().min(5).max(50).required(),
      phone: Joi.string().min(11).max(15),
      email: Joi.string().min(5).max(50).email().required(),
      address: Joi.string().min(10).max(100).required(),
      businessId: Joi.string(),
      logo: Joi.string(),
      institutionConfig: Joi.object(),
      modules: Joi.any(),
      id: Joi.string()
    });
    const { error } = validationSchema.validate(req.body);
    console.log("error", error)
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} update validation failed with error: ${error.details[0].message}`,
        errorCode: "INS06",
        statusCode: 500
      });
    console.log("begin update")
    const filePath = path.normalize(req.file.path);
    const fileName = path.basename(filePath).toLocaleLowerCase();
    const {name, phone, address, email, logo, modules, institutionConfig, id} = req.body;
    const data = {name, phone, address, email, logo: fileName, modules, institutionConfig};
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
        errorCode: "INS06",
        statusCode: 500
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
      errorCode: "INS07",
      statusCode: 500
    });
  }
});

/**
 * @desc Institution
 * @route POST /api/v2/institution/delete
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
        errorCode: "INS08",
        statusCode: 502
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} delete failed with error ${error.message}`,
      errorCode: "INS09",
      statusCode: 500
    });
  }
});

/**
 * @desc InstitutionDocumentType
 * @route POST /api/v2/institution/addDocType
 * @access Institution admin
 */
exports.addDocType = asyncHandler(async (req, res, next) => {
  let createdBy = req.user.id || null;
  let validationSchema;
  try {
    /**
     * validate request body
     * @type {Joi.ObjectSchema<any>}
     */
    validationSchema = Joi.object({
      name: Joi.string().min(5).max(50).required(),
      abbr: Joi.string(),
      type: Joi.any(),
      institutionId: Joi.string(),
    });
    const { error } = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} document type create validation failed with error: ${error.details[0].message}`,
        errorCode: "SUBO1",
        statusCode: 406,
      });
    let { name, abbr, type, institutionId } = req.body;
    const ObjectId = require("mongoose").Types.ObjectId;
    subjectContainer = {
      name:name.toUpperCase(),
      abbr:abbr.toLowerCase(),
      type,
      createdBy,
      institutionId,
    };
    const create = await helper.InstitutionHelper.createInstitutionDocumentType(subjectContainer);
    await logger.filecheck(
        `INFO: ${subjectPascal}: ${name} created by ${createdBy}: at ${time} with data ${JSON.stringify(
            create
        )} \n`
    );
    return utils.send_json_response({
      res,
      data: create,
      msg: `${subjectPascal} document type successfully created.`,
      statusCode: 201
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} document type create failed with error ${error.message}, code: ${error.errorCode}`,
      errorCode: "SUBO2",
      statusCode: 502,
    });
  }
});

/**
 * @desc InstitutionDocumentType
 * @route POST /api/v2/institution/updateDocType
 * @access Institution admin
 */
exports.listDocType = asyncHandler(async (req, res, next) => {
  try {
    let createdBy = req.user.id || null;
    /**
     * build query options for mongoose-paginate
     */
    const queryOptions = await utils.buildQueryOptions(req.query);
    if (typeof queryOptions === "string") {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${queryOptions} is not valid!`,
        errorCode: "SUBO3",
        statusCode: 400,
      });
    }
    /**
     * fetch paginated data using queryOptions
     */
    const ObjectId = require("mongoose").Types.ObjectId;
    let where = {};
    // use this for fields that has boolean values or 1 and 0
    if (!_.isEmpty(req.body.institutionId) && req.body.institutionId) {
      where.institutionId = new ObjectId(req.body.institutionId);
    }
    if (!_.isEmpty(req.body.type) && req.body.type) {
      where.type = {  $in: req.body.type };
    }
    if (!_.isEmpty(req.body.name) && req.body.name) {
      where.name = {
        $regex: ".*" + req.body.name + ".*",
        $options: "i",
      };
    }
    if (!_.isEmpty(req.body.abbr) && req.body.abbr) {
      where.abbr = {
        $regex: ".*" + req.body.abbr + ".*",
        $options: "i",
      };
    }
    const objWithoutMeta = await helper.InstitutionHelper.getInstitutionDocumentTypes({
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
          `INFO: ${subjectPascal} document type list by: ${createdBy}, at ${time} with data ${JSON.stringify(
              obj
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: `${subjectPascal} document type list successfully fetched`,
        statusCode: 200
      });
    } else {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `No record!`,
        errorCode: "SUBO4",
        statusCode: 400,
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} document type list failed with error ${error.message}`,
      errorCode: "SUBO5",
      statusCode: 500,
    });
  }
});

/**
 * @desc InstitutionDocumentType
 * @route POST /api/v2/institution/updateDocType
 * @access Institution admin
 */
exports.updateDocType = asyncHandler(async (req, res) => {
  let createdBy = req.user.id;
  let validationSchema;
  try {
    validationSchema = Joi.object({
      name: Joi.string().min(5).max(50),
      abbr: Joi.string(),
      type: Joi.any(),
      id: Joi.string(),
    });
    const { error } = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} document type update validation failed with error: ${error.details[0].message}`,
        errorCode: "SUBO6",
        statusCode: 406,
      });
    const { name, abbr, type, id } = req.body;
    const data = { name:name.toUpperCase(), abbr:abbr.toLowerCase(), type, createdBy };
    const ObjectId = require("mongoose").Types.ObjectId;
    const update = await helper.InstitutionHelper.updateInstitutionDocumentType({
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
        errorCode: "SUBO7",
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
      errorCode: "SUBO8",
      statusCode: 500,
    });
  }
});

/**
 * @desc InstitutionDocumentType
 * @route POST /api/v2/institution/deleteDocType
 * @access Institution admin
 */
exports.removeDocType = asyncHandler(async (req, res, next) => {
  try {
    let deletedBy = req.user.id;
    let { ids } = req.body;
    let model = "InstitutionDocumentType";
    const ObjectId = require("mongoose").Types.ObjectId;
    ids.map((d) => new ObjectId(d));
    let del = await helper.backupAndDelete({
      ids,
      deletedBy,
      model,
    });
    if(del.deletedCount >= 1){
      await logger.filecheck(
          `INFO: ${subjectPascal} document type deleted: by ${deletedBy} at ${time} with data ${JSON.stringify(
              del
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: del,
        msg: `${subjectPascal} document type successfully deleted`,
        statusCode: 200
      });
    }else{
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} document type delete failed`,
        errorCode: "SUBO9",
        statusCode: 501
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} document type delete failed with error ${error.message}`,
      errorCode: "SUB10",
      statusCode: 500,
    });
  }
});
