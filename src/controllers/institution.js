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
 */
exports.add = asyncHandler(async (req, res, next) => {
  let institutionValidationSchema;
  let sender;
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
      modules: Joi.any()
    });
    const {error} = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} create validation failed with error: ${error.details[0].message}`,
        errorCode: "E401",
        statusCode: 200
      });
    let createdBy = req.user.id || null;
    let {name, phone, email, address, businessId, logo, modules} = req.body;
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
    const instManagerCreate_URL = `${req.protocol}://${req.get(
        "host"
    )}/api/v2/institution/add-manager/${create.institutionCode}`;

    console.log(`*** begin email sending ***`);
    let subject = "Institution Admin Creation";
    let emailParams = {
      heading: `"Institution Created"`,
      previewText:
          "Tiwo Exam Portal is awesome!",
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
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} create failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 200
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
        errorCode: "E501",
        statusCode: 200
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
      });
    } else {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `No record!`,
        errorCode: "E404",
        statusCode: 200
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} list failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 200
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
        errorCode: "E401",
        statusCode: 200
      });
    console.log("begin update")
    const {name, phone, address, email, logo, modules, institutionConfig, id} = req.body;
    const data = {name, phone, address, email, logo, modules, institutionConfig};
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
        errorCode: "E401"
      });
    return utils.send_json_response({
      res,
      data: update.result,
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `Error: ${error} `,
      errorCode: error.errorCode,
      statusCode: 200
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
      });
    }else{
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `${subjectPascal} delete failed`,
        errorCode: "E501",
        statusCode: 200
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `${subjectPascal} delete failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 200
    });
  }
});
