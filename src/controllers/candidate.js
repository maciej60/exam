const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const utils = require("../utils");
const helper = require("../utils/model_helpers");
const _ = require("lodash");
const generator = require("generate-password");
const logger = require("../utils/logger");
const { parseInt } = require("lodash");
const Joi = require("joi");
const next = require("locutus/php/array/next");
const emailTemplate = require("../utils/emailTemplate");
const { log } = require("locutus/php/math");
const time = new Date(Date.now()).toLocaleString();
const fs = require("fs");
const XLSX = require("xlsx");
const path = require("path");

/**
 * @desc Candidate
 * @route POST /api/v2/candidate/add
 * @access PUBLIC
 */
exports.add = asyncHandler(async (req, res, next) => {
  let email_log_data;
  try {
    let createdBy = req.user.id || null;
    let {
      title,
      firstName,
      lastName,
      middleName,
      email,
      phone,
      candidateTypeId,
      institutionId,
      gender,
    } = req.body;
    if (!institutionId)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Institution must be provided to proceed`,
        errorCode: "E404",
        statusCode: 400,
      });
    const validationSchema = Joi.object({
      firstName: Joi.string().min(1).max(50).required(),
      lastName: Joi.string().min(1).max(50).required(),
      middleName: Joi.string(),
      email: Joi.string().min(5).max(50).email().required(),
      phone: Joi.string().min(9).max(15).required(),
      institutionId: Joi.string(),
      title: Joi.string().min(2).max(10).required(),
      candidateTypeId: Joi.string().required(),
      gender: Joi.string().max(20).min(4),
    });
    const { error } = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Institution Candidate create failed with validation error ${error.details[0].message}`,
        errorCode: "E502",
        statusCode: 406,
      });
    const ObjectId = require("mongoose").Types.ObjectId;
    let institution = await helper.InstitutionHelper.getInstitution({ _id: new ObjectId(institutionId) });
    if (_.isEmpty(institution))
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Institution does not exist`,
        errorCode: "E404",
        statusCode: 500,
      });
    institution = institution[0];
    institutionId = institution._id;
    const check_candidate_already_created =
      await helper.CandidateHelper.getCandidate({
        $or: [{ email }, { phone }],
      });
    if (check_candidate_already_created)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Institution Candidate email/phone already exist`,
        errorCode: "E404",
        statusCode: 201,
      });
    /**
     * assemble user params for create
     */
    let pw = generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: false,
    });
    let pw_hashed = await utils.hashPassword(pw);
    let candidate_data = {
      title,
      firstName,
      lastName,
      middleName,
      candidateCode: await helper.CandidateHelper.generateCode(),
      email,
      phone,
      candidateTypeId,
      institutionId,
      gender,
      firstLogin: 1,
      status: 1,
      password: pw_hashed,
      createdBy
    };
    const create_candidate = await helper.CandidateHelper.createCandidate(
      candidate_data
    );
    if (create_candidate) {
      await logger.filecheck(
        `INFO: Institution Candidate created for institution ${institutionId}: by ${createdBy} at ${time} with data ${JSON.stringify(
          create_candidate
        )} \n`
      );

      /**
       * begin email sending
       */
        let success = 0;
        let p;
        let emailPhone = email + " or " + phone;
        let emailParams = {
          heading: "Your Candidate account created successfully",
          previewText: "Exam portal is good!",
          emailPhone,
          email,
          password: pw,
          message: "This exam portal is good.",
          institutionCode: institution.institutionCode,
          institutionName: institution.name,
        };
        p = {
          to: email,
          message: emailTemplate.newUser(emailParams),
          subject: "Candidate Created ",
        };
        const send_email = await utils.send_email_api(p);
        if (send_email.response.Code === "02") {
          success = 1;
        }
        console.log(`*** email sent ***`);
        email_log_data = {
          email: email,
          requestData: send_email.request,
          responseData: send_email.response,
          emailLogStatus: success,
        };
        const create_email_log = await helper.EmailLogHelper.createEmailLog(
          email_log_data
        );
        console.log(`*** email-log added ***`);

      return utils.send_json_response({
        res,
        data: create_candidate,
        msg: "Institution Candidate successfully created",
        statusCode: 201
      });
    } else {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Institution Candidate not created`,
        errorCode: "E501",
        statusCode: 501,
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `Institution Candidate create failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 500,
    });
  }
});

/**
 * @desc list Candidates
 * @route GET /api/v2/candidate/list
 * @access Institution User
 */
exports.list = asyncHandler(async (req, res, next) => {
  try {
    //let createdBy = req.user.id;
    if (_.isEmpty(req.query)) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Provide query params like sort, page and per_page!`,
        errorCode: "E501",
        statusCode: 200,
      });
    }
    const ObjectId = require("mongoose").Types.ObjectId;
    let where = {};
    if (!_.isEmpty(req.body.name) && req.body.name) {
      where["$or"] = [
        {
          lastName: {
            $regex: ".*" + req.body.name + ".*",
            $options: "i",
          }
        },
        {
          firstName: {
            $regex: ".*" + req.body.name + ".*",
            $options: "i",
          }
        }
      ]
    }
    if (!_.isEmpty(req.body.institutionId) && req.body.institutionId) {
      where.institutionId = new ObjectId(req.body.institutionId);
    }
    if (!_.isEmpty(req.body.candidateTypeId) && req.body.candidateTypeId) {
      where.candidateTypeId = new ObjectId(req.body.candidateTypeId);
    }
    if (!_.isEmpty(req.body.email) && req.body.email) {
      where.email = (req.body.email);
    }
    if (!_.isEmpty(req.body.phone) && req.body.phone) {
      where.phone = (req.body.phone);
    }
    if (!_.isEmpty(req.body.gender) && req.body.gender) {
      where.gender = (req.body.gender);
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
        errorCode: "E501",
        statusCode: 406,
      });
    }
    /**
     * fetch paginated data using queryOptions
     */
    const objWithoutMeta = await helper.CandidateHelper.getCandidates({
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
        `INFO: Candidates list by:, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: "Candidate list successfully fetched",
      });
    } else {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `No record!`,
        errorCode: "E404",
        statusCode: 404,
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `Candidate list failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 500,
    });
  }
});

/**
 * @desc Update Candidate Details
 * @route POST /api/v2/candidate/update
 * @access PUBLIC
 */
exports.update = asyncHandler(async (req, res, next) => {
  try {
    let createdBy = req.user.id || null;
    let {
      title,
      firstName,
      lastName,
      middleName,
      email,
      phone,
      status,
      id,
    } = req.body;
    if (!id)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `User not provided`,
        errorCode: "E404",
        statusCode: 406,
      });
    const validationSchema = Joi.object({
      firstName: Joi.string().min(1).max(50),
      lastName: Joi.string().min(1).max(50),
      middleName: Joi.string(),
      email: Joi.string().min(5).max(50).email(),
      phone: Joi.string().min(9).max(15),
      status: Joi.number().min(0).max(1),
      title: Joi.string().min(2).max(10),
      id: Joi.string().required(),
    });
    const { error } = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Candidate update failed with validation error ${error.details[0].message}`,
        errorCode: "E501",
        statusCode: 200,
      });
    /**
     * assemble user params for update
     */
    const ObjectId = require("mongoose").Types.ObjectId;
    const record = await helper.CandidateHelper.getCandidate({ _id: id });
    if (!record) {
      return utils.send_json_error_response({
        res,
        data: {},
        msg: "Record not found",
        errorCode: "E401",
        statusCode: 404
      });
    }
    const filePath = path.normalize(req.file.path);
    const fileName = path.basename(filePath).toLocaleLowerCase();
    let candidate_data = {
      title,
      firstName,
      lastName,
      middleName,
      email,
      phone,
      status,
      photoUrl: fileName,
    };
    const update_candidate = await helper.CandidateHelper.findUpdate({
      filter: {
        _id: new ObjectId(id),
      },
      update: {
        $set: candidate_data,
      },
      options: { upsert: true, new: true },
    });
    if (!update_candidate.result) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: update_candidate.message,
        errorCode: "E401333",
        statusCode: 500
      });
    } else {
      await logger.filecheck(
        `INFO: Candidate updated : by ${createdBy} at ${time} with data ${JSON.stringify(
          update_candidate.result
        )} \n`
      );
      return utils.send_json_response({
        res,
        data: update_candidate.result,
        msg: "Candidate successfully updated",
        statusCode: 201
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `Candidate update failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 500,
    });
  }
});

/**
 * @desc Candidate delete
 * @route POST /api/v2/candidate/delete
 * @access PUBLIC
 */
exports.remove = asyncHandler(async (req, res, next) => {
  try {
    let deletedBy = req.user.id;
    let { ids } = req.body;
    let model = "Candidate";
    const ObjectId = require("mongoose").Types.ObjectId;
    ids.map((d) => new ObjectId(d));
    let del = await helper.backupAndDelete({
      ids,
      deletedBy,
      model,
    });
    if (del.deletedCount >= 1) {
      await logger.filecheck(
        `INFO: Candidate deleted: by ${deletedBy} at ${time} with data ${JSON.stringify(
          del
        )} \n`
      );
      return utils.send_json_response({
        res,
        data: del,
        msg: `Candidate successfully deleted`,
      });
    } else {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Candidate delete failed`,
        errorCode: "E501",
        statusCode: 200,
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `Candidate delete failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 200,
    });
  }
});

// Mass upload

exports.importCandidate = asyncHandler(async (req, res, next) => {
  let email_log_data;
  try {
    let createdBy = req.user.id || null;
    let { candidateTypeId, institutionId } = req.body;
    if (!institutionId)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Institution must be provided to proceed`,
        errorCode: "E404",
        statusCode: 406,
      });
    const validationSchema = Joi.object({
      institutionId: Joi.string().required(),
      candidateTypeId: Joi.string().required(),
    });
    const { error } = validationSchema.validate(req.body);
    if (error)
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Institution Candidate create failed with validation error ${error.details[0].message}`,
        errorCode: "E502",
        statusCode: 406,
      });
    const ObjectId = require("mongoose").Types.ObjectId;
    let institution = await helper.InstitutionHelper.getInstitution({ _id: new ObjectId(institutionId) });
    if (_.isEmpty(institution))
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Institution does not exist`,
        errorCode: "E404",
        statusCode: 406,
      });
    institution = institution[0];
    institutionId = institution._id;
    /**
     * assemble user params for create
     */
    const filePath = path.normalize(req.file.path);
    const excel_data = await utils.excelToJson(filePath);
    let pw = generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: false,
    });
    let pw_hashed = await utils.hashPassword(pw);
    let candidate_data = [];
    let codes = [];

    //generate candidate codes
    for (let i = 0; i <= excel_data.length - 1; i++) {
      let code = await helper.CandidateHelper.generateCode();
      codes.push(code);
    }
    let emailData = [];
    await excel_data.forEach((element) => {
      let email = element.email
      let phone = element.phone
      let code = codes.pop();
      candidate_data.push({
        title: element.title,
        firstName: element.firstName,
        lastName: element.lastName,
        middleName: element.middleName,
        candidateCode: code,
        email,
        phone,
        candidateTypeId: candidateTypeId,
        institutionId: institutionId,
        gender: element.gender,
        password: pw_hashed,
        createdBy
      });
      /**
       * build multiple email params
       */
      let p;
      let emailPhone = email + " or " + phone;
      let emailParams = {
        heading: "Your Candidate account created successfully",
        previewText: "Exam portal is good!",
        emailPhone,
        email,
        password: pw,
        message: "This exam portal is good.",
        institutionCode: institution.institutionCode,
        institutionName: institution.name,
      };
      p = {
        to: email,
        message: emailTemplate.newUser(emailParams),
        subject: "Candidate Created ",
      };
      emailData.push(p);
    });
    const upload_candidates = await helper.CandidateHelper.uploadCandidates(
      candidate_data
    );
    if (upload_candidates) {
      await logger.filecheck(
        `INFO: Institution Candidate created for institution ${institutionId}: by ${createdBy} at ${time} with data ${JSON.stringify(
          upload_candidates
        )} \n`
      );
      /**
       * begin mass sending using external service
       */
      /*for (const obj of emailData) {
        let success = 0;
        const send_email = await utils.send_email_api(obj);
        if (send_email.response.Code === "02") {
          success = 1;
        }
        console.log(`*** email sent ***`);
        email_log_data = {
          email: email,
          requestData: send_email.request,
          responseData: send_email.response,
          emailLogStatus: success,
        };
        const create_email_log = await helper.EmailLogHelper.createEmailLog(
            email_log_data
        );
        console.log(`*** email-log added ***`);
      }*/

      return utils.send_json_response({
        res,
        data: upload_candidates,
        msg: "Institution Candidates successfully Uploaded",
        statusCode: 201
      });
    } else {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Institution Candidates not Uploaded`,
        errorCode: "E501",
        statusCode: 500,
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `Institution Candidate Upload failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 500,
    });
  }
});
