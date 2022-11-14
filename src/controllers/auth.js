const ErrorResponse = require("../utils/errorResponse");
require("dotenv").config();
const asyncHandler = require("../middleware/async");
const { validate } = require("validate.js");
const bcrypt = require("bcryptjs");
const utils = require("../utils");
const generator = require("generate-password");
const helper = require("../utils/model_helpers");
const _ = require("lodash");
const logger = require("../utils/logger");
let appRoot = require("app-root-path");
let emailTemplate = require(`${appRoot}/src/utils/emailTemplate`);
const time = new Date(Date.now()).toLocaleString();

/**
 * @desc Login 
 * @route POST /api/v2/auth/login
 * @access PUBLIC
 */

exports.login = asyncHandler(async (req, res, next) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return next(
      new ErrorResponse("Email/Phone and password is required", 200, "E301-100")
    );
  }
  const check_user = await helper.UserHelper.getUser({
    $or: [{ email: login }, { phone: login }],
  });  
  if (!check_user) {
    return next(
      new ErrorResponse("Email or password is incorrect", 200, "E301-102")
    );
  }
  const isMatch = await utils.comparePassword(password, check_user.password);
  if (!isMatch) {
    return next(
      new ErrorResponse("Email or password is incorrect", 200, "E301-103")
    );
  }
  const get_user = await helper.UserHelper.getUser(check_user._id);
  if (check_user.firstLogin == 1) {
    utils.sendNoTokenResponse(
      get_user,
      200,
      res,
      "First time login, kindly change your password",
      "default-password"
    );
  }
  if (check_user.isAdmin == 1) {
    
  }
  utils.sendTokenResponse(get_user, 200, res, "User login successful");
});

/**
 * @desc forgotPassword module
 * @route POST /api/v2/auth/forgotPassword
 * @access PUBLIC
 */

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  try {

    /**
     * build constraints for validate.js
     */
    const constraints = {
      login: {
        presence: {
          allowEmpty: false,
          message: "Email address is required",
        },
        email: false,
      },
    };
    /**
     * destructure the request body and pick the needed params
     */
    const { login, reset_url } = req.body;
    if (!login) {
      return next(new ErrorResponse("Login is required", 200, "e404"));
    }

    /**
     * do validation, if it fails log and return response to user,else proceed and start processing
     */
    const validation = validate(
      {
        login,
      },
      constraints
    );

    if (validation) {
      /**
       * validation fails
       */
      await logger.filecheck(
          `ERROR(E11): Forgot password failed , at ${time} with error ${
              Object.values(validation)[0]
          } \n`
      );
      return next(
        new ErrorResponse(`${Object.values(validation)[0]}`, 200, "E300")
      );
    }

    let isEmail, isPhone = false;
    let check_user = await helper.UserHelper.getUser({ email: login });
    if (check_user) {
      isEmail = true;
    }else{
      check_user = await helper.UserHelper.getUser({ phone: login });
      if (check_user) {
        isPhone = true;
      }
    }
    if (!check_user) {
      return next(
        new ErrorResponse("Email/Phone do not exist!", 200, "e404")
      );
    }
    let sender;
    let user_id = check_user._id;
    let url = reset_url + "?e0779Binary=" + user_id;
    let success = 0;
    /**
     * begin send sms
     */
    if(isPhone){
      phone = login;
      console.log(`*** begin sms sending ***`);
      let to = phone;
      let message = `Password reset link: ${url}`;
      console.log(`*** sms data: ${message} ***`);
      sender = await utils.send_sms_api({
        to,
        message,
      });
      if (
        sender.response.StatusCode == "101" ||
        sender.response.StatusCode == "102" ||
        sender.response.StatusCode == "100" ||
        sender.response.Status == "Success"
      ) {
        success = 1;
      }
      sms_log_data = {
        phone,
        requestData: sender.request,
        responseData: sender.response,
        smsLogStatus: success,
      };
      const create_sms_log = await helper.SmsLogHelper.createSmsLog(
        sms_log_data
      );
      console.log(`*** smslog added ***`);
    }
    /**
     * begin send email
     */
    if (isEmail) {
      let email = login;
      console.log(`*** begin email sending ***`);
      let subject = "Password Reset";
      let emailParams = {
        heading: `Forgot Password`,
        previewText:
          "Tiwo Exam Portal is awesome!",
        message:
          "This exam portal is designed to help institutions conduct quiz.",
        url: url,
        url_text: reset_url,
      };
      let template = emailTemplate.forgotPassword(emailParams);
      let p = {
        to: email,
        message: template,
        subject,
      };
      sender = await utils.send_email_api(p);
      if (sender.response.Code == "02") {
        success = 1;
      }
      let email_log_data = {
        email,
        requestData: sender.request,
        responseData: sender.response,
        emailLogStatus: success,
      };
      const create_email_log = await helper.EmailLogHelper.createEmailLog(
        email_log_data
      );
       console.log(`*** emailLog created ***`);
    }
    
    return utils.send_json_response({
      res,
      data: sender.response,
      msg: "Forgot password link successfully sent",
    });
  } catch (error) {
    return next(
      new ErrorResponse(
        `Forgot password failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc resetPassword module
 * @route POST /api/v2/auth/resetPassword
 * @access PUBLIC
 */

exports.resetPassword = asyncHandler(async (req, res, next) => {
  try {

    /**
     * build constraints for validate.js
     */
    const constraints = {
      password: {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
        length: {
          minimum: 8,
          maximum: 20,
          message: "must be between 8 and 20 characters",
        },
      },
    };
    /**
     * destructure the request body and pick the needed params
     */
    let { password, resetPasswordCode } = req.body;

    /**
     * do validation, if it fails log and return response to user,else proceed and start processing
     */
    const validation = validate(
      {
        password,
      },
      constraints
    );

    if (validation) {
      /**
       * validation fails
       */
      await logger.filecheck(
          `ERROR(E11): Reset password failed , at ${time} with error ${
              Object.values(validation)[0]
          } \n`
      );
      return next(
        new ErrorResponse(`${Object.values(validation)[0]}`, 200, "E300")
      );
    }

    if (!(await utils.passwordPolicyPassed(password))) {
      return next(new ErrorResponse("Password should contain a letter, number, upper, lower, special character and greater than 8!", 200, "e404"));
    }

    const ObjectId = require("mongoose").Types.ObjectId;
    if (!ObjectId.isValid(resetPasswordCode)) {
      return next(new ErrorResponse("User do not exist", 200, "e404"));
    }

    let user_id = new ObjectId(resetPasswordCode);
    const check_user = await helper.UserHelper.getUser({
      _id: user_id,
    });
 
    if (!check_user) {
      return next(new ErrorResponse("User account do not exist!", 200, "e404"));
    }

    let old_password = check_user.password;
    let passwordResets = check_user.passwordResets;
    if (await utils.passwordResetMatches(passwordResets, password)) {
      return next(
        new ErrorResponse("This password is already used!", 200, "e404")
      );
    }
    
    password = await utils.hashPassword(password);
    const save_password_reset = await helper.UserHelper.savePasswordReset({
      user_id,
      old_password,
      new_password: password
    });

    /**
     * begin email send
     */
    let email = check_user.email;
    let success = 0;
    let subject = "Password Reset";
    let emailParams = {
      heading: `Password Reset Successful`,
      previewText:
        "Exam portal is good!",
      message:
        "Your password is successfully reset, kindly login and proceed.",
    };
    let template = emailTemplate.resetPassword(emailParams);
    let p = {
      to: email,
      message: template,
      subject,
    };
    const send_email = await utils.send_email_api(p);
    if (send_email.response.Code == "02") {
      success = 1;
    }
    console.log(`*** email sent ***`);
    let email_log_data = {
      email,
      requestData: send_email.request,
      responseData: send_email.response,
      emailLogStatus: success,
    };
    const create_email_log = await helper.EmailLogHelper.createEmailLog(
      email_log_data
    );
    console.log(`*** emaillog added ***`);

    return utils.send_json_response({
      res,
      data: send_email.response,
      msg: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(
        `Password reset failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc resetPassword module
 * @route POST /api/v2/auth/resetPassword
 * @access PUBLIC
 */

exports.changePassword = asyncHandler(async (req, res, next) => {
  try {

    /**
     * build constraints for validate.js
     */
    const constraints = {
      password: {
        presence: {
          allowEmpty: false,
          message: "is required",
        },
        length: {
          minimum: 8,
          maximum: 20,
          message: "must be between 8 and 20 characters",
        },
      },
    };
    /**
     * destructure the request body and pick the needed params
     */
    let { password, currentPassword, user_id } = req.body;

    /**
     * do validation, if it fails log and return response to user,else proceed and start processing
     */
    const validation = validate(
      {
        password,
      },
      constraints
    );

    if (validation) {
      /**
       * validation fails
       */
      await logger.filecheck(
          `ERROR(E11): Change password failed , at ${time} with error ${
              Object.values(validation)[0]
          } \n`
      );
      return next(
        new ErrorResponse(`${Object.values(validation)[0]}`, 200, "E300")
      );
    }

    if (!(await utils.passwordPolicyPassed(password))) {
      return next(new ErrorResponse("Password should contain a letter, number, upper, lower, special character and greater than 8!", 200, "e404"));
    }

    const ObjectId = require("mongoose").Types.ObjectId;
    if (!ObjectId.isValid(user_id)) {
      return next(new ErrorResponse("User do not exist", 200, "e404"));
    }
    user_id = new ObjectId(user_id);
    const check_user = await helper.UserHelper.getUser({
      _id: user_id,
    });
    if (!check_user) {
      return next(new ErrorResponse("User account do not exist!", 200, "e404"));
    }

    let old_password = check_user.password;
    let passwordResets = check_user.passwordResets;

    if (!await utils.comparePassword(currentPassword, old_password)) {
      return next(new ErrorResponse("Current password provided do not match!", 200, "e404"));
    }

    if (await utils.passwordResetMatches(passwordResets, password)) {
      return next(
        new ErrorResponse("The new password provided is already used!", 200, "e404")
      );
    }
    
    password = await utils.hashPassword(password);
    const save_password_reset = await helper.UserHelper.savePasswordReset({
      user_id,
      old_password,
      new_password: password
    });

    let email = check_user.email;
    let success = 0;
    let subject = "Change Password";
    let emailParams = {
      heading: `Change Password Successful`,
      previewText:
        "Exam portal is good!",
      message: "Your password is successfully changed, kindly login and proceed.",
    };
    let template = emailTemplate.changePassword(emailParams);

    let p = {
      to: email,
      message: template,
      subject,
    };
    const send_email = await utils.send_email_api(p);
    if (send_email.response.Code == "02") {
      success = 1;
    }
    console.log(`*** email sent ***`);
    let email_log_data = {
      email,
      requestData: send_email.request,
      responseData: send_email.response,
      emailLogStatus: success,
    };
    const create_email_log = await helper.EmailLogHelper.createEmailLog(
      email_log_data
    );
    console.log(`*** emaillog added ***`);

    return utils.send_json_response({
      res,
      data: send_email.response,
      msg: "Password change successful",
    });
  } catch (error) {
    return next(
      new ErrorResponse(
        `Password change failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});


