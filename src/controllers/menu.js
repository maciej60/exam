const ErrorResponse = require("../utils/errorResponse");
require("dotenv").config();
const asyncHandler = require("../middleware/async");
const { validate } = require("validate.js");
const utils = require("../utils");
const helper = require("../utils/model_helpers");
const _ = require("lodash");
const logger = require("../utils/logger");
let appRoot = require("app-root-path");
let emailTemplate = require(`${appRoot}/src/utils/emailTemplate`);
const {parseInt} = require("lodash");
const time = new Date(Date.now()).toLocaleString();

/**
 * @desc addSystemMenu
 * @route POST /api/v2/menu/addSystemMenu
 * @access PUBLIC
 */
exports.addMenu = asyncHandler(async (req, res, next) => {
  try{
    let createdBy = req.user.id;
    let { menuObject, menuHeaderId, moduleId, forSystemAdmin, forInstitutionAdmin } = req.body;
    if (!menuObject) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: "menuObject is required",
        errorCode: "MEN01",
        statusCode: 400
      });
    }
    if (!menuHeaderId) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: "menuHeaderId is required",
        errorCode: "MEN01",
        statusCode: 400
      });
    }
    if (!moduleId) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: "Menu module is required",
        errorCode: "MEN02",
        statusCode: 400
      });
    }
    let SystemMenuData = { menuObject, moduleId, menuHeaderId, forSystemAdmin, forInstitutionAdmin}
    let add_menu = await helper.MenuHelper.createMenu(SystemMenuData);
    await logger.filecheck(
        `INFO: System menu created: by ${createdBy} at ${time} with data ${JSON.stringify(
            add_menu
        )} \n`
    );
    return utils.send_json_response({
      res,
      data: add_menu,
      msg: "System menu added successfully",
      statusCode: 201
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `System menu create failed with error ${error.message}`,
      errorCode: "MEN03",
      statusCode: 500
    });
  }
});

/**
 * @desc addInstitutionMenu
 * @route POST /api/v2/menu/addInstitutionMenu
 * @access PUBLIC
 */
exports.addInstitutionMenu = asyncHandler(async (req, res, next) => {
  try{
    let createdBy = req.user.id;
    const { institutionId, menuData } = req.body;
    if (!institutionId) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: "Institution is required",
        errorCode: "MEN04",
        statusCode: 400
      });
    }
    if (!menuData) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: "Please provide menu paths",
        errorCode: "MEN05",
        statusCode: 406
      });
    }
    let institutionMenuData = {institutionId, menuData, createdBy}
    let add_menu = await helper.MenuHelper.createInstitutionMenu(institutionMenuData);
    await logger.filecheck(
        `INFO: Institution menu created: by ${createdBy} at ${time} with data ${JSON.stringify(
            add_menu
        )} \n`
    );
    return utils.send_json_response({
      res,
      data: add_menu,
      msg: "Institution menu added successfully",
      statusCode: 201
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `Institution menu create failed with error ${error.message}`,
      errorCode: "MEN06",
      statusCode: 500
    });
  }
});

/**
 * @desc addUserMenu
 * @route POST /api/v2/menu/addUserMenu
 * @access PUBLIC
 */
exports.addUserMenu = asyncHandler(async (req, res, next) => {
  try{
    let createdBy = req.user.id;
    const { institutionId, userId, menuData } = req.body;
    if (!menuData) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Provided the menu data`,
        errorCode: "MEN07",
        statusCode: 400
      });
    }
    if (!userId) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `User is not provided`,
        errorCode: "MEN08",
        statusCode: 400
      });
    }
    if (!institutionId) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: "Institution is not provided",
        errorCode: "MEN08",
        statusCode: 400
      });
    }
    let data = {institutionId, userId, menuData, createdBy}
    let add_menu = await helper.MenuHelper.createUserMenu(data);
    await logger.filecheck(
        `INFO: User menu created: by ${createdBy} at ${time} with data ${JSON.stringify(
            add_menu
        )} \n`
    );
    return utils.send_json_response({
      res,
      data: add_menu,
      msg: "User menu added successfully",
      statusCode: 201
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `User menu create failed with error ${error.message}`,
      errorCode: "MEN10",
      statusCode: 500
    });
  }
});

/**
 * @desc getSystemMenu
 * @route POST /api/v2/menu/getMenu
 * @access PUBLIC
 */
exports.getMenu = asyncHandler(async (req, res, next) => {
  try{
    let createdBy = req.user.id;
    const ObjectId = require("mongoose").Types.ObjectId;
    let where = {};
    if (!_.isEmpty(req.body.moduleId) && req.body.moduleId) {
      where.moduleId = new ObjectId(req.body.moduleId);
    }
    if (!_.isEmpty(req.body.menuHeaderId) && req.body.menuHeaderId) {
      where.menuHeaderId = new ObjectId(req.body.menuHeaderId);
    }
    if (req.body.hasOwnProperty("forSystemAdmin")) {
      where.forSystemAdmin = parseInt(req.body.forSystemAdmin);
    }
    if (req.body.hasOwnProperty("forInstitutionAdmin")) {
      where.forInstitutionAdmin = parseInt(req.body.forInstitutionAdmin);
    }
    const obj = await helper.MenuHelper.getMenu(where);
    if(obj) {
      await logger.filecheck(
          `INFO: System menu fetched successfully by: ${createdBy} with data ${JSON.stringify(
              obj
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: "System menu successfully fetched",
        statusCode: 200
      });
    }else{
      return utils.send_json_error_response({
        res,
        data: [],
        msg:  `No record!`,
        errorCode: "MEN11",
        statusCode: 404
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg:  `System menu fetch failed with error ${error.message}`,
      errorCode: "MEN12",
      statusCode: 500
    });
  }
});

/**
 * @desc getInstitutionMenu
 * @route POST /api/v2/menu/getInstitutionMenu
 * @access PUBLIC
 */
exports.getInstitutionMenu = asyncHandler(async (req, res, next) => {
  try{
    let createdBy = req.user.id;
    const { institutionId } = req.body;
    if (!institutionId) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg:  "Institution is not provided",
        errorCode: "MEN13",
        statusCode: 400
      });
    }
    const obj = await helper.MenuHelper.getInstitutionMenu({institutionId});
    const main = await helper.MenuHelper.getMenu({});
    const build = utils.buildMenu(main, obj)
    if(obj){
      await logger.filecheck(
          `INFO: Institution menu of ${institutionId} fetched successfully by: ${createdBy} with data ${JSON.stringify(
              obj
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: build,
        msg: "Institution menu successfully fetched",
        statusCode: 200
      });
    }else{
      return utils.send_json_error_response({
        res,
        data: [],
        msg:  `No record!`,
        errorCode: "MEN14",
        statusCode: 404
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg:  `Institution menu fetch failed with error ${error.message}`,
      errorCode: "MEN15",
      statusCode: 500
    });
  }
});

/**
 * @desc getUserMenu
 * @route POST /api/v2/menu/getUserMenu
 * @access PUBLIC
 */
exports.getUserMenu = asyncHandler(async (req, res, next) => {
  try{
    let createdBy = req.user.id;
    const { userId } = req.body;
    if (!userId) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg:  "User is not provided",
        errorCode: "MEN16",
        statusCode: 400
      });
    }
    const obj = await helper.MenuHelper.getUserMenu({userId});
    const main = await helper.MenuHelper.getMenu({});
    const build = utils.buildMenu(main, obj)
    if(obj){
      await logger.filecheck(
          `INFO: User menu of ${userId} fetched successfully by: ${createdBy} with data ${JSON.stringify(
              obj
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: build,
        msg: "User menu successfully fetched",
        statusCode: 200
      });
    }else{
      return utils.send_json_error_response({
        res,
        data: [],
        msg:  `No record!`,
        errorCode: "MEN17",
        statusCode: 404
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg:  `System menu create failed with error ${error.message}`,
      errorCode: "MEN18",
      statusCode: 500
    });
  }
});






