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
const time = new Date(Date.now()).toLocaleString();

/**
 * @desc addSystemMenu
 * @route POST /api/v2/menu/addSystemMenu
 * @access PUBLIC
 */
exports.addSystemMenu = asyncHandler(async (req, res, next) => {
  try{
    let createdBy = req.user.id;
    let { title, icon, route, href, target, children, module, forSystemAdmin, forInstitutionAdmin } = req.body;
    if (!title) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: "Title is required",
        errorCode: "E404",
        statusCode: 200
      });
    }
    if (!module) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: "Menu module is required",
        errorCode: "E404",
        statusCode: 200
      });
    }
    let SystemMenuData = {title, icon, route, href, target, children, module, forSystemAdmin, forInstitutionAdmin}
    let add_menu = await helper.MenuHelper.createSystemMenu(SystemMenuData);
    await logger.filecheck(
        `INFO: System menu created: by ${createdBy} at ${time} with data ${JSON.stringify(
            add_menu
        )} \n`
    );
    return utils.send_json_response({
      res,
      data: add_menu,
      msg: "System menu added successfully",
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `System menu create failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 200
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
    const { institutionId, systemMenuId } = req.body;
    if (!institutionId) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: "Institution is required",
        errorCode: "E404",
        statusCode: 200
      });
    }
    if (!systemMenuId) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: "Please select an existing system menu",
        errorCode: "E404",
        statusCode: 200
      });
    }
    let institutionMenuData = {institutionId, systemMenuId, createdBy}
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
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `Institution menu create failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 200
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
    const { institutionId, userId, userMenuData } = req.body;
    if (!userMenuData) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `Provided the menu data`,
        errorCode: "E404",
        statusCode: 200
      });
    }
    if (!userId) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: `User is not provided`,
        errorCode: "E404",
        statusCode: 200
      });
    }
    if (!institutionId) {
      return utils.send_json_error_response({
        res,
        data: [],
        msg: "Institution is not provided",
        errorCode: "E404",
        statusCode: 200
      });
    }
    let data = {institutionId, userId, userMenuData, createdBy}
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
    });
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg: `User menu create failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 200
    });
  }
});

/**
 * @desc getSystemMenu
 * @route POST /api/v2/menu/getSystemMenu
 * @access PUBLIC
 */
exports.getSystemMenu = asyncHandler(async (req, res, next) => {
  try{
    let createdBy = req.user.id;
    const obj = await helper.MenuHelper.getSystemMenu({});
    if(obj){
      await logger.filecheck(
          `INFO: System menu fetched successfully by: ${createdBy} with data ${JSON.stringify(
              obj
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: "System menu successfully fetched",
      });
    }else{
      return utils.send_json_error_response({
        res,
        data: [],
        msg:  `No record!`,
        errorCode: "E404",
        statusCode: 200
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg:  `System menu fetch failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 200
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
        errorCode: "E404",
        statusCode: 200
      });
    }
    const obj = await helper.MenuHelper.getInstitutionMenu({institutionId});
    if(obj){
      await logger.filecheck(
          `INFO: Institution menu of ${institutionId} fetched successfully by: ${createdBy} with data ${JSON.stringify(
              obj
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: "Institution menu successfully fetched",
      });
    }else{
      return utils.send_json_error_response({
        res,
        data: [],
        msg:  `No record!`,
        errorCode: "E404",
        statusCode: 200
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg:  `Institution menu fetch failed with error ${error.message}`,
      errorCode: error.errorCode,
      statusCode: 200
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
        errorCode: "E404",
        statusCode: 200
      });
    }
    const obj = await helper.MenuHelper.getUserMenu({userId});
    if(obj){
      await logger.filecheck(
          `INFO: User menu of ${userId} fetched successfully by: ${createdBy} with data ${JSON.stringify(
              obj
          )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: "User menu successfully fetched",
      });
    }else{
      return utils.send_json_error_response({
        res,
        data: [],
        msg:  `No record!`,
        errorCode: "E404",
        statusCode: 200
      });
    }
  } catch (error) {
    return utils.send_json_error_response({
      res,
      data: [],
      msg:  `System menu create failed with error ${error.message}`,
      errorCode: "E404",
      statusCode: 200
    });
  }
});

/**
 * @desc Test
 * @route POST /api/v2/menu/test
 * @access PUBLIC
 */
exports.test = asyncHandler(async (req, res, next) => {
  try{
    const { login, password, title, icon, route, href, target, children, institutionId, systemMenuId, createdBy, userId, userMenuData } = req.body;
    if (!login || !password) {
      return next(
          new ErrorResponse("Email/Phone and password is required", 200, "E301-100")
      );
    }
    const check_user = await helper.UserHelper.getUser({
      $or: [{ email: login }, { phone: login }],
    });
    const get_user = await helper.UserHelper.getUser(check_user._id);

    /*let institutionMenuData = {institutionId, systemMenuId, createdBy}
    let add_menu = await helper.MenuHelper.createInstitutionMenu(institutionMenuData);
    const get_menu = await helper.MenuHelper.getInstitutionMenu({});*/

    /*let SystemMenuData = {title, icon, route, href, target, children}
    let add_menu = await helper.MenuHelper.createSystemMenu(SystemMenuData);
    const get_menu = await helper.MenuHelper.getSystemMenu({});*/

    /*
      let data = {institutionId, userId, userMenuData}
      let add_user_menu = await helper.MenuHelper.createUserMenu(data);
      const get_menu = await helper.MenuHelper.getUserMenu({userId});
      */

    if(get_user){

    }
    const get_menu = await helper.MenuHelper.getUserMenu({userId, institutionId});
    utils.sendTokenResponse(get_menu, 200, res, "User login successful");
  } catch (error) {
    return next(
        new ErrorResponse(
            `System menu create failed with error ${error.message}`,
            200,
            error.errorCode
        )
    );
  }
});





