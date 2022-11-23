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

let subjectPascal = "Subject";
let subjectCamel = "subject";
let subjectSmall = "subject";
let subjectContainer = "subjectData";
let subjectHelperCreate = helper.SubjectHelper.createSubject;
let subjectHelperGet = helper.SubjectHelper.getSubjects;
let subjectHelperUpdate = helper.SubjectHelper.findUpdate;

// Subject Topic
let subjectTopicPascal = "SubjectTopic";
let subjectTopicCamel = "SubjectTopic";
let subjectTopicSmall = "SubjectTopic";
let subjectTopicContainer = "SubjectTopicData";
let subjectTopicHelperCreate = helper.SubjectHelper.createSubjectTopic;
let subjectTopicHelperGet = helper.SubjectHelper.getSubjectTopics;
let subjectTopicHelperUpdate = helper.SubjectHelper.findUpdateSubjectTopic;

// SubTopic
let subTopicPascal = "SubTopic";
let subTopicCamel = "subTopic";
let subTopicSmall = "subTopic";
let subTopicContainer = {};
let subTopicHelperCreate = helper.SubjectHelper.createSubTopic;
let subTopicHelperGet = helper.SubjectHelper.getSubTopics;
let subTopicHelperUpdate = helper.SubjectHelper.findUpdateSubTopic;

/**
 * @desc Application
 * @route POST /api/v1/subject/add
 * @access PUBLIC
 */
exports.add = asyncHandler(async (req, res, next) => {
    let createdBy = req.user.id || null;
    let validationSchema;
    try {
        /**
         * validate request body
         * @type {Joi.ObjectSchema<any>}
         */
        validationSchema = Joi.object({
            name: Joi.string().min(5).max(50).required(),
            institutionId: Joi.string(),
        });
        const { error } = validationSchema.validate(req.body);
        if (error)
            return utils.send_json_error_response({
                res,
                data: [],
                msg: `${subjectPascal} create validation failed with error: ${error.details[0].message}`,
                errorCode: "E401",
                statusCode: 200,
            });
        let { name, institutionId } = req.body;
        const ObjectId = require("mongoose").Types.ObjectId;
        subjectContainer = {
            name,
            code: await helper.SubjectHelper.generateSubjectCode,
            createdBy,
            institutionId,
        };
        const create = await subjectHelperCreate(subjectContainer);
        await logger.filecheck(
            `INFO: ${subjectPascal}: ${name} created by ${createdBy}: at ${time} with data ${JSON.stringify(
                create
            )} \n`
        );
        return utils.send_json_response({
            res,
            data: create,
            msg: `${subjectPascal} successfully created.`,
        });
    } catch (error) {
        return utils.send_json_error_response({
            res,
            data: [],
            msg: `${subjectPascal} create failed with error ${error.message}`,
            errorCode: error.errorCode,
            statusCode: 200,
        });
    }
});

/**
 * @desc Subject
 * @route POST /api/v1/subject/list
 * @access subject
 */
exports.list = asyncHandler(async (req, res, next) => {
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
                errorCode: "E501",
                statusCode: 200,
            });
        }
        /**
         * fetch paginated data using queryOptions
         */
        const ObjectId = require("mongoose").Types.ObjectId;
        let where = {};
        // use this for fields that has boolean values or 1 and 0
        if (req.body.hasOwnProperty("status")) {
            where.status = parseInt(req.body.status);
        }
        if (!_.isEmpty(req.body.institutionId) && req.body.institutionId) {
            where.institutionId = new ObjectId(req.body.institutionId);
        }
        if (!_.isEmpty(req.body.createdBy) && req.body.createdBy) {
            where.createdBy = new ObjectId(req.body.createdBy);
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
            });
        } else {
            return utils.send_json_error_response({
                res,
                data: [],
                msg: `No record!`,
                errorCode: "E404",
                statusCode: 200,
            });
        }
    } catch (error) {
        return utils.send_json_error_response({
            res,
            data: [],
            msg: `${subjectPascal} list failed with error ${error.message}`,
            errorCode: error.errorCode,
            statusCode: 200,
        });
    }
});

/**
 * @desc subject
 * @route POST /api/v2/subject/update
 * @access PUBLIC
 */
exports.update = asyncHandler(async (req, res) => {
    //let createdBy = req.user.id;
    let validationSchema;
    try {
        validationSchema = Joi.object({
            name: Joi.string().min(5).max(50),
            id: Joi.string(),
        });
        const { error } = validationSchema.validate(req.body);
        if (error)
            return utils.send_json_error_response({
                res,
                data: [],
                msg: `${subjectPascal} update validation failed with error: ${error.details[0].message}`,
                errorCode: "E401",
                statusCode: 200,
            });
        const { name, id } = req.body;
        const data = { name };
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
                errorCode: "E401",
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
            statusCode: 200,
        });
    }
});

/**
 * @desc subject
 * @route POST /api/v2/subject/delete
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
            statusCode: 200,
        });
    }
});

// Subject Topic controller

/**
 * @desc Subject Topic
 * @route POST /api/v1/subject/topic/add
 * @access PUBLIC
 */
exports.addTopic = asyncHandler(async (req, res, next) => {
    let validationSchema;
    try {
        /**
         * validate request body
         * @type {Joi.ObjectSchema<any>}
         */
        validationSchema = Joi.object({
            name: Joi.string().min(5).max(50).required(),
            institutionId: Joi.string(),
            subjectId: Joi.string(),
        });
        const { error } = validationSchema.validate(req.body);
        if (error)
            return utils.send_json_error_response({
                res,
                data: [],
                msg: `${subjectTopicPascal} create validation failed with error: ${error.details[0].message}`,
                errorCode: "E401",
                statusCode: 200,
            });
        let createdBy = req.user.id || null;
        let { name, institutionId, subjectId } = req.body;
        const ObjectId = require("mongoose").Types.ObjectId;
        subjectTopicContainer = {
            name,
            createdBy,
            institutionId,
            subjectId,
        };
        const create = await subjectTopicHelperCreate(subjectTopicContainer);
        await logger.filecheck(
            `INFO: ${subjectTopicPascal}: ${name} created at ${time} with data ${JSON.stringify(
                create
            )} \n`
        );
        return utils.send_json_response({
            res,
            data: create,
            msg: `${subjectTopicPascal} successfully created.`,
        });
    } catch (error) {
        return utils.send_json_error_response({
            res,
            data: [],
            msg: `${subjectTopicPascal} create failed with error ${error.message}`,
            errorCode: error.errorCode,
            statusCode: 200,
        });
    }
});

/**
 * @desc Subject Topic
 * @route POST /api/v1/subject/topic/list
 * @access users
 */
exports.listTopics = asyncHandler(async (req, res, next) => {
    try {
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
                statusCode: 200,
            });
        }
        const ObjectId = require("mongoose").Types.ObjectId;
        let where = {};
        // use this for fields that has boolean values or 1 and 0
        if (req.body.hasOwnProperty("status")) {
            where.status = parseInt(req.body.status);
        }
        if (!_.isEmpty(req.body.institutionId) && req.body.institutionId) {
            where.institutionId = new ObjectId(req.body.institutionId);
        }
        if (!_.isEmpty(req.body.subjectId) && req.body.subjectId) {
            where.subjectId = new ObjectId(req.body.subjectId);
        }
        if (!_.isEmpty(req.body.createdBy) && req.body.createdBy) {
            where.createdBy = new ObjectId(req.body.createdBy);
        }
        /**
         * fetch paginated data using queryOptions
         */
        const objWithoutMeta = await subjectTopicHelperGet({
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
                `INFO: ${subjectTopicPascal} list by: , at ${time} with data ${JSON.stringify(
                    obj
                )} \n`
            );
            return utils.send_json_response({
                res,
                data: obj,
                msg: `${subjectTopicPascal} list successfully fetched`,
            });
        } else {
            return utils.send_json_error_response({
                res,
                data: [],
                msg: `No record!`,
                errorCode: "E404",
                statusCode: 200,
            });
        }
    } catch (error) {
        return utils.send_json_error_response({
            res,
            data: [],
            msg: `${subjectPascal} list failed with error ${error.message}`,
            errorCode: error.errorCode,
            statusCode: 200,
        });
    }
});

/**
 * @desc Subject Topic
 * @route POST /api/v2/topic/update
 * @access PUBLIC
 */
exports.updateTopic = asyncHandler(async (req, res) => {
    //let createdBy = req.user.id;
    let validationSchema;
    try {
        validationSchema = Joi.object({
            name: Joi.string().min(5).max(50),
            status: Joi.number().min(0).max(1),
            subjectId: Joi.string(),
            id: Joi.string(),
        });
        const { error } = validationSchema.validate(req.body);
        if (error)
            return utils.send_json_error_response({
                res,
                data: [],
                msg: `${subjectTopicPascal} update validation failed with error: ${error.details[0].message}`,
                errorCode: "E401",
                statusCode: 200,
            });
        const { name, status, id, subjectId } = req.body;
        const data = { name, status, subjectId };
        const ObjectId = require("mongoose").Types.ObjectId;
        const update = await subjectTopicHelperUpdate({
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
                errorCode: "E401",
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
            statusCode: 200,
        });
    }
});

/**
 * @desc Subject Topic
 * @route POST /api/v2/topic/delete
 * @access PUBLIC
 */
exports.removeTopic = asyncHandler(async (req, res, next) => {
    try {
        let deletedBy = req.user.id;
        let { ids } = req.body;
        let model = subjectTopicPascal;
        const ObjectId = require("mongoose").Types.ObjectId;
        ids.map((d) => new ObjectId(d));
        let del = await helper.backupAndDelete({
            ids,
            deletedBy,
            model,
        });
        if(del.deletedCount >= 1){
            await logger.filecheck(
                `INFO: ${subjectTopicPascal} deleted: by ${deletedBy} at ${time} with data ${JSON.stringify(
                    del
                )} \n`
            );
            return utils.send_json_response({
                res,
                data: del,
                msg: `${subjectTopicPascal} successfully deleted`,
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
            msg: `${subjectTopicPascal} delete failed with error ${error.message}`,
            errorCode: error.errorCode,
            statusCode: 200,
        });
    }
});

// Institution SubTopic

/**
 * @desc Subject
 * @route POST /api/v1/subject/subTopic/add
 * @access PUBLIC
 */
exports.addSubTopic = asyncHandler(async (req, res, next) => {
    let validationSchema;
    try {
        /**
         * validate request body
         * @type {Joi.ObjectSchema<any>}
         */
        validationSchema = Joi.object({
            name: Joi.string().min(5).max(50).required(),
            tags: Joi.array().items(Joi.string().required()),
            institutionId: Joi.string(),
            subjectId: Joi.string(),
            topicId: Joi.string(),
        });
        const { error } = validationSchema.validate(req.body);
        if (error)
            return utils.send_json_error_response({
                res,
                data: [],
                msg: `${subTopicPascal} create validation failed with error: ${error.details[0].message}`,
                errorCode: "E401",
                statusCode: 200,
            });
        let createdBy = req.user.id || null;
        let { name, institutionId, subjectId, tags, topicId } = req.body;
        const ObjectId = require("mongoose").Types.ObjectId;
        subTopicContainer = {
            name,
            createdBy,
            institutionId,
            subjectId,
            topicId,
            tags,
        };
        const create = await subTopicHelperCreate(subTopicContainer);
        await logger.filecheck(
            `INFO: ${subTopicPascal}: ${name} created at ${time} with data ${JSON.stringify(
                create
            )} \n`
        );
        return utils.send_json_response({
            res,
            data: create,
            msg: `${subTopicPascal} successfully created.`,
        });
    } catch (error) {
        return utils.send_json_error_response({
            res,
            data: [],
            msg: `${subTopicPascal} create failed with error ${error.message}`,
            errorCode: error.errorCode,
            statusCode: 200,
        });
    }
});

/**
 * @desc subject
 * @route POST /api/v2/subject/subTopic/list
 * @access user
 */
exports.listSubTopics = asyncHandler(async (req, res, next) => {
    try {
        //let createdBy = req.user.id;
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
                statusCode: 200,
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
        if (!_.isEmpty(req.body.institutionId) && req.body.institutionId) {
            where.institutionId = new ObjectId(req.body.institutionId);
        }
        if (!_.isEmpty(req.body.subjectId) && req.body.subjectId) {
            where.subjectId = new ObjectId(req.body.subjectId);
        }
        if (!_.isEmpty(req.body.topicId) && req.body.topicId) {
            where.topicId = new ObjectId(req.body.topicId);
        }
        if (!_.isEmpty(req.body.tags) && req.body.tags) {
            where.tags = {  $in: req.body.tags };
        }
        const objWithoutMeta = await subTopicHelperGet({
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
                `INFO: ${subTopicPascal} list by: , at ${time} with data ${JSON.stringify(
                    obj
                )} \n`
            );
            return utils.send_json_response({
                res,
                data: obj,
                msg: `${subTopicPascal} list successfully fetched`,
            });
        } else {
            return utils.send_json_error_response({
                res,
                data: [],
                msg: `No record!`,
                errorCode: "E404",
                statusCode: 200,
            });
        }
    } catch (error) {
        return utils.send_json_error_response({
            res,
            data: [],
            msg: `${subjectPascal} list failed with error ${error.message}`,
            errorCode: error.errorCode,
            statusCode: 200,
        });
    }
});

/**
 * @desc Sub Topic
 * @route POST /api/v2/application/update
 * @access PUBLIC
 */
exports.updateSubTopic = asyncHandler(async (req, res) => {
    //let createdBy = req.user.id;
    let validationSchema;
    try {
        validationSchema = Joi.object({
            name: Joi.string().min(5).max(50),
            tags: Joi.array().items(Joi.string()),
            subjectId: Joi.string(),
            topicId: Joi.string(),
            id: Joi.string(),
        });
        const { error } = validationSchema.validate(req.body);
        if (error)
            return utils.send_json_error_response({
                res,
                data: [],
                msg: `${subTopicPascal} update validation failed with error: ${error.details[0].message}`,
                errorCode: "E401",
                statusCode: 200,
            });
        const { name, id, subjectId, tags, topicId } = req.body;
        const data = { name, tags, subjectId, topicId };
        const ObjectId = require("mongoose").Types.ObjectId;
        const update = await subTopicHelperUpdate({
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
                errorCode: "E401",
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
            statusCode: 200,
        });
    }
});

/**
 * @desc SubTopic
 * @route POST /api/v2/subject/subTopic/delete
 * @access PUBLIC
 */
exports.removeSubTopic = asyncHandler(async (req, res, next) => {
    try {
        let deletedBy = req.user.id;
        let { ids } = req.body;
        let model = subTopicPascal;
        const ObjectId = require("mongoose").Types.ObjectId;
        ids.map((d) => new ObjectId(d));
        let del = await helper.backupAndDelete({
            ids,
            deletedBy,
            model,
        });
        if(del.deletedCount >= 1){
            await logger.filecheck(
                `INFO: ${subTopicPascal} deleted: by ${deletedBy} at ${time} with data ${JSON.stringify(
                    del
                )} \n`
            );
            return utils.send_json_response({
                res,
                data: del,
                msg: `${subTopicPascal} successfully deleted`,
            });
        }else{
            return utils.send_json_error_response({
                res,
                data: [],
                msg: `${subTopicPascal} delete failed`,
                errorCode: "E501",
                statusCode: 200
            });
        }
    } catch (error) {
        return utils.send_json_error_response({
            res,
            data: [],
            msg: `${subTopicPascal} delete failed with error ${error.message}`,
            errorCode: error.errorCode,
            statusCode: 200,
        });
    }
});