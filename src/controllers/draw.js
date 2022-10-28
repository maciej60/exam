const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const utils = require("../utils");
const helper = require("../utils/model_helpers");
const _ = require("lodash");
const logger = require("../utils/logger");
const time = new Date(Date.now()).toLocaleString();
let appRoot = require("app-root-path");
const shufflingFrequency = utils.getShufflingFrequency();
let emailTemplate = require(`${appRoot}/src/utils/emailTemplate`);

/**
 * @desc Draws
 * @route POST /api/v2/draw/add
 * @access PUBLIC
 */
exports.add = asyncHandler(async (req, res, next) => {
  try {
    let createdBy = req.user.id;
    let { drawMonth, drawYear, drawDescription, drawCriteria, noOfRewards, id } =
      req.body;
    drawMonth = parseInt(drawMonth);
    drawYear = parseInt(drawYear);
    const ObjectId = require("mongoose").Types.ObjectId;
    /**
     * drawCriteria: receipts.receiptItemName, receipts.receiptDate before, users.userType, receipts.receiptAmount range
     */
    let draw_data = {
      drawMonth,
      drawYear,
      noOfRewards,
      drawDescription,
      drawCriteria,
      createdBy,
    };
    let make_draw = await helper.DrawHelper.findUpsertDraw({
      filter: {
        _id: new ObjectId(id),
      },
      create: draw_data,
      update: {
        $set: draw_data,
      },
      options: { upsert: true, new: true },
    });
    logger.filecheck(
      `INFO: RRS draw created: by ${createdBy} at ${time} with data ${JSON.stringify(
        make_draw
      )} \n`
    );
    return utils.send_json_response({
      res,
      data: make_draw,
      msg: "Draw successfully created",
    });
  } catch (error) {
    return next(
      new ErrorResponse(
        `RRS draw create failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc Draws
 * @route POST /api/v2/draw/update
 * @access PUBLIC
 */
exports.update = asyncHandler(async (req, res, next) => {
  try {
    let createdBy = req.user.id;
    let {
      drawMonth,
      drawYear,
      drawDescription,
      drawCriteria,
      noOfRewards,
      id,
    } = req.body;
    drawMonth = parseInt(drawMonth);
    drawYear = parseInt(drawYear);
    const ObjectId = require("mongoose").Types.ObjectId;
    /**
     * drawCriteria: receipts.receiptItemName, receipts.receiptDate before, users.userType, receipts.receiptAmount range
     */
    let draw_data = {
      drawMonth,
      drawYear,
      noOfRewards,
      drawDescription,
      drawCriteria,
      createdBy,
    };
    let make_draw = await helper.DrawHelper.findUpsertDraw({
      filter: {
        _id: new ObjectId(id),
      },
      create: draw_data,
      update: {
        $set: draw_data,
      },
      options: { upsert: true, new: true },
    });
    logger.filecheck(
      `INFO: RRS draw updated: by ${createdBy} at ${time} with data ${JSON.stringify(
        make_draw
      )} \n`
    );
    return utils.send_json_response({
      res,
      data: make_draw,
      msg: "Draw successfully updated",
    });
  } catch (error) {
    return next(
      new ErrorResponse(
        `RRS draw update failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc Draws
 * @route POST /api/v2/draw/delete
 * @access PUBLIC
 */
exports.deleteDraw = asyncHandler(async (req, res, next) => {
  try {
    let deletedBy = req.user.id;
    let { ids } = req.body;
    let model = "Draw";
    const ObjectId = require("mongoose").Types.ObjectId;
    ids.map((d) => new ObjectId(d));
    let delete_draw = await helper.UserHelper.backupAndDelete({
      ids,
      deletedBy,
      model,
    });
    logger.filecheck(
      `INFO: RRS draw deleted: by ${deletedBy} at ${time} with data ${JSON.stringify(
        delete_draw
      )} \n`
    );
    return utils.send_json_response({
      res,
      data: delete_draw,
      msg: "Draw successfully deleted",
    });
  } catch (error) {
    return next(
      new ErrorResponse(
        `RRS draw delete failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc Draws
 * @route GET /api/v2/draw/rewardedDraws
 * @access PUBLIC
 */
exports.rewarded = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    if (_.isEmpty(req.query)) {
      return next(
        new ErrorResponse(
          "Provide query params like sort, page and per_page",
          200,
          "E500"
        )
      );
    }
    const isAdmin = await helper.UserHelper.isAdmin(userId);
    if (!isAdmin) {
      return next(new ErrorResponse(`You are not authorized!`, 200, "E401"));
    }
    /**
     * build query options for mongoose-paginate
     */
    let queryOptions = await utils.buildQueryOptions(req.query);
    queryOptions && !queryOptions.sort.drawMonth
      ? (queryOptions.sort.drawMonth = "desc")
      : queryOptions.sort;

    queryOptions && !queryOptions.sort.drawYear
      ? (queryOptions.sort.drawYear = "desc")
      : queryOptions.sort;

    if (typeof queryOptions === "string") {
      return next(new ErrorResponse(queryOptions, 200, "E500"));
    }

    /**
     * fetch paginated data using queryOptions
     * drawStatus=0 means rewarded
     */
    let where = { drawStatus: 0 };
    const objWithoutMeta = await helper.DrawHelper.getDraws({
      where,
      queryOptions,
    });

    if (objWithoutMeta.data && !_.isEmpty(objWithoutMeta.data)) {
      /**
       * build response data meta for pagination
       */
      let url = req.protocol + "://" + req.get("host") + req.originalUrl;
      const obj = await utils.buildResponseMeta({ url, obj: objWithoutMeta });

      logger.filecheck(
        `INFO: route /rewarded reached with _id: ${userId}, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );

      return utils.send_json_response({
        res,
        data: obj,
        msg: "RRS rewarded draw fetch successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `RRS rewarded draw fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc Draws
 * @route GET /api/v2/draw/nonRewardedDraws
 * @access PUBLIC
 */
exports.nonRewarded = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    if (_.isEmpty(req.query)) {
      return next(
        new ErrorResponse(
          "Provide query params like sort, page and per_page",
          200,
          "E500"
        )
      );
    }
    const isAdmin = await helper.UserHelper.isAdmin(userId);
    if (!isAdmin) {
      return next(new ErrorResponse(`You are not authorized!`, 200, "E401"));
    }
    /**
     * build query options for mongoose-paginate
     */
    let queryOptions = await utils.buildQueryOptions(req.query);
    queryOptions && !queryOptions.sort.drawMonth
      ? (queryOptions.sort.drawMonth = "desc")
      : queryOptions.sort;
    queryOptions && !queryOptions.sort.drawYear
      ? (queryOptions.sort.drawYear = "desc")
      : queryOptions.sort;

    if (typeof queryOptions === "string") {
      return next(new ErrorResponse(queryOptions, 200, "E500"));
    }

    /**
     * fetch paginated data using queryOptions
     * drawStatus=1 means non-rewarded
     */
    let where = { drawStatus: 1 };
    const objWithoutMeta = await helper.DrawHelper.getDraws({
      where,
      queryOptions,
    });

    if (objWithoutMeta.data && !_.isEmpty(objWithoutMeta.data)) {
      /**
       * build response data meta for pagination
       */
      let url = req.protocol + "://" + req.get("host") + req.originalUrl;
      const obj = await utils.buildResponseMeta({ url, obj: objWithoutMeta });

      logger.filecheck(
        `INFO: route /nonRewarded reached with _id: ${userId}, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: "RRS rewarded draw fetch successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `RRS rewarded draw fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc Draws
 * @route GET /api/v2/draw/singleDraw
 * @access PUBLIC
 */
exports.single = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    const isAdmin = await helper.UserHelper.isAdmin(userId);
    if (!isAdmin) {
      return next(new ErrorResponse(`You are not authorized!`, 200, "E401"));
    }
    if (_.isEmpty(req.params.id)) {
      return next(new ErrorResponse("Provide ID param", 200, "E500"));
    }
    let idIsValid = await utils.isValidObjectId(req.params.id);

    if (!idIsValid) {
      return next(new ErrorResponse("Provide valid ID param", 200, "E500"));
    }

    /**
     * fetch record
     */
    const ObjectId = require("mongoose").Types.ObjectId;
    let where = { _id: new ObjectId(req.params.id) };
    const obj = await helper.DrawHelper.getDraw({
      where,
      params: { shufflingFrequency },
    });

    if (obj) {
      logger.filecheck(
        `INFO: route /singleDraw reached with _id: ${userId}, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: "RRS draw successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `RRS draw fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc Draws
 * @route GET /api/v2/draw/allDraws
 * @access PUBLIC
 */
exports.all = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    if (_.isEmpty(req.query)) {
      return next(
        new ErrorResponse(
          "Provide query params like sort, page and per_page",
          200,
          "E500"
        )
      );
    }
    const isAdmin = await helper.UserHelper.isAdmin(userId);
    if (!isAdmin) {
      return next(new ErrorResponse(`You are not authorized!`, 200, "E401"));
    }
    /**
     * build query options for mongoose-paginate
     */
    let queryOptions = await utils.buildQueryOptions(req.query);
    queryOptions && !queryOptions.sort.drawMonth
      ? (queryOptions.sort.drawMonth = "desc")
      : queryOptions.sort;
    queryOptions && !queryOptions.sort.drawYear
      ? (queryOptions.sort.drawYear = "desc")
      : queryOptions.sort;

    /* queryOptions && queryOptions.limit && queryOptions.limit > 8
      ? (queryOptions.limit = 8)
      : queryOptions.limit; */

    if (typeof queryOptions === "string") {
      return next(new ErrorResponse(queryOptions, 200, "E500"));
    }

    /**
     * fetch paginated data using queryOptions
     * drawStatus=1 means non-rewarded
     */
    let where = {};
    const objWithoutMeta = await helper.DrawHelper.getDraws({
      where,
      queryOptions,
    });

    if (objWithoutMeta.data && !_.isEmpty(objWithoutMeta.data)) {
      /**
       * build response data meta for pagination
       */
      let url = req.protocol + "://" + req.get("host") + req.originalUrl;
      const obj = await utils.buildResponseMeta({ url, obj: objWithoutMeta });

      logger.filecheck(
        `INFO: route /nonRewarded reached with _id: ${userId}, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: "RRS rewarded draw fetch successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `RRS rewarded draw fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc Draw select winners
 * @route POST /api/v2/draw/select
 * @access PUBLIC
 */
exports.select = asyncHandler(async (req, res, next) => {
  try {
    let createdBy = req.user.id;
    let taxId = req.user.taxId;
    const isAdmin = await helper.UserHelper.isAdmin(createdBy);
    if (!isAdmin) {
      return next(new ErrorResponse(`You are not authorized!`, 200, "E401"));
    }
    const { drawId } = req.body;
    const ObjectId = require("mongoose").Types.ObjectId;
    let where = { _id: new ObjectId(drawId) };
    let get_draw = await helper.DrawHelper.getDraw({
      where,
      params: { shufflingFrequency },
    });
    if (_.isEmpty(get_draw) || get_draw == null) {
      return next(new ErrorResponse(`RRS draw not found`, 200, "E404"));
    }
    get_draw =
      _.isArray(get_draw) && get_draw.length >= 1 ? get_draw[0] : get_draw;
    const {
      _id,
      noOfRewards,
      drawCriteria,
      drawMonth,
      drawYear,
      drawDescription,
      drawStatus,
    } = get_draw;
    let get_parsed_criteria = await helper.DrawHelper.parseDrawCriteria({
      criteria: drawCriteria,
      draw_month: drawMonth,
      draw_year: drawYear,
    });
        
    let qualifiers = await helper.DrawHelper.selectWinners({
      receipt_where: get_parsed_criteria.receipt_where,
      rrs_code_where: get_parsed_criteria.rrs_code_where,
      receipt_date_obj: get_parsed_criteria.receipt_date_obj,
    });
    qualifiersCount = qualifiers.length;
    if (qualifiers) {
      let obj = {
        result: qualifiers,
        meta: {
          qualifiersCount,
          noOfRewards,
          shufflingFrequency,
          locked: drawStatus == 1 ? 0 : 1,
          createdBy,
          taxId,
          drawId: _id,
          drawDescription,
        },
      };
      logger.filecheck(
        `INFO: RRS draw winners selected: by ${taxId} at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: "Draw winner(s) successfully selected",
      });
    } else {
      return next(
        new ErrorResponse(
          `RRS draw winners selection failed with error: no records selected`
        )
      );
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `RRS draw winners selection failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc Draw pickWinners 
 * @route POST /api/v2/draw/pickWinners
 * @access PUBLIC
 */
exports.pickWinners = asyncHandler(async (req, res, next) => {
  try {
    let createdBy = req.user.id;
    let taxId = req.user.taxId;
    const isAdmin = await helper.UserHelper.isAdmin(createdBy);
    if (!isAdmin) {
      return next(new ErrorResponse(`You are not authorized!`, 200, "E401"));
    }
    const { drawId } = req.body;
    const ObjectId = require("mongoose").Types.ObjectId;
    let where = { _id: new ObjectId(drawId) };
    let get_draw = await helper.DrawHelper.getDraw({
      where,
      params: { shufflingFrequency },
    });
    if (_.isEmpty(get_draw) || get_draw == null) {
      return next(new ErrorResponse(`RRS draw not found`, 200, "E404"));
    }
    get_draw =
      _.isArray(get_draw) && get_draw.length >= 1 ? get_draw[0] : get_draw;
    const {
      _id,
      noOfRewards,
      drawCriteria,
      drawMonth,
      drawYear,
      drawDescription,
      drawStatus,
    } = get_draw;
    let get_parsed_criteria = await helper.DrawHelper.parseDrawCriteria({
      criteria: drawCriteria,
      draw_month: drawMonth,
      draw_year: drawYear,
    });
    let qualifiers = await helper.DrawHelper.selectWinners({
      receipt_where: get_parsed_criteria.receipt_where,
      rrs_code_where: get_parsed_criteria.rrs_code_where,
      receipt_date_obj: get_parsed_criteria.receipt_date_obj,
    });
    qualifiersCount = qualifiers.length;
    if (qualifiers) {
      let winners = await utils.pickFromShuffledArray(
        qualifiers,
        shufflingFrequency,
        noOfRewards
      );
      let obj = {
        result: winners,
        meta: {
          winnersCount: winners.length,
          qualifiersCount,
          noOfRewards,
          shufflingFrequency,
          locked: drawStatus == 1 ? 0 : 1,
          createdBy,
          taxId,
          drawId: _id,
          drawDescription,
        },
      };
      logger.filecheck(
        `INFO: RRS draw winners selected: by ${taxId} at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: "Draw winner(s) successfully selected",
      });
    } else {
      return next(
        new ErrorResponse(
          `RRS draw winners selection failed with error: no records selected`
        )
      );
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `RRS draw winners selection failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc Draw lock winners
 * @route POST /api/v2/draw/lock
 * @access PUBLIC
 */
exports.lock = asyncHandler(async (req, res, next) => {
  try {
    let createdBy = req.user.id;
    let taxId = req.user.taxId;
    const isAdmin = await helper.UserHelper.isAdmin(createdBy);
    if (!isAdmin) {
      return next(new ErrorResponse(`You are not authorized!`, 200, "E401"));
    }

    const { rewardData, drawId } = req.body;
    if (rewardData) {
      _.forEach(rewardData, async (u) => {
        if (u) {
          await helper.RewardHelper.createDrawRewards({
            draw_id: drawId,
            data: u,
          });
          let phone = u.rewardData.userPhone;
          let email = u.rewardData.userEmail;
          let name = u.rewardData.userName;
          let rrsCode = u.rewardData.rrsCode;
          /**
           * begin sms sending
           */
          console.log(`*** begin sms sending ***`);
          let success = 0;
          let to = phone;
          let message = `You have earned a reward by particpating in ${process.env.APP_NAME}, Kindly present your RRSCODE: ${rrsCode}`;
          console.log(`*** sms message: ${message} ***`);
          const send_sms = await utils.send_sms_api({
            to,
            message,
            encoded: false,
          });
          if (
            send_sms.response.StatusCode == "101" ||
            send_sms.response.StatusCode == "102" ||
            send_sms.response.StatusCode == "100" ||
            send_sms.response.Status == "Success"
          ) {
            success = 1;
          }
          sms_log_data = {
            phone,
            requestData: send_sms.request,
            responseData: send_sms.response,
            smsLogStatus: success,
          };
          const create_sms_log = await helper.SmsLogHelper.createSmsLog(
            sms_log_data
          );
          console.log( `*** smslog added , begin email sending ***`);

          /**
           * begin email sending
           */
          let emailParams = {
            heading: "Congratulations!",
            previewText:
              "RRS is a revenue reward scheme designed to appreciate tax-payers and make revenue collection a bit fun!",
            message: `We are happy to inform you that you have earned a reward by participating in the ${process.env.APP_NAME} using this RRSCODE: ${rrsCode}. \n
            The board of Internal Revenue will communicate to you directly on the day you should come for your gift item. \n
            Once again, Congratulations!`,
            name,
          };
          p = {
            to: email,
            message: emailTemplate.drawWinner(emailParams),
            subject: "Revenue Reward Scheme Winner Notification",
          };
          const send_email = await utils.send_email_api(p);
          if (send_email.response.Code == "02") {
            success2 = 1;
          }
          console.log(`*** email sent ***`);
          email_log_data = {
            email: email,
            requestData: send_email.request,
            responseData: send_email.response,
            emailLogStatus: success2,
          };
          const create_email_log = await helper.EmailLogHelper.createEmailLog(
            email_log_data
          );
          console.log(`*** emaillog added ***`);
        }
      });

      const lock = await helper.RewardHelper.lockDraw(drawId);
      logger.filecheck(
        `INFO: RRS draw winners locked by userId: ${createdBy} at ${time} with data ${JSON.stringify(
          lock
        )} \n`
      );
      return utils.send_json_response({
        res,
        data: lock,
        msg: "Draw winner(s) successfully locked",
      });
    } else {
      return next(
        new ErrorResponse(
          `RRS draw winners lock failed with error: no records selected`
        )
      );
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `RRS draw winners lock failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc monthlyRrs
 * @route GET /api/v2/admin/monthlyRrs
 * @access PUBLIC
 *  @params userId, taxId
 */
exports.monthlyRrs = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;

    const isAdmin = await helper.UserHelper.isAdmin(userId);
    if (!isAdmin) {
      return next(new ErrorResponse(`You are not authorized!`, 200, "E401"));
    }

    let { month, year } = req.query;
    const currDayMonthYear = await utils.currDayMonthYear();
    month =  !(month) || month == null || typeof  month == undefined
       ? (parseInt(currDayMonthYear.month))
       : parseInt(month);
    year =
      !year || year == null || typeof year == undefined
        ? parseInt(currDayMonthYear.year)
        : parseInt(year); 
    /**
     * build query options for mongoose-paginate
     */
    const queryOptions = await utils.buildQueryOptions(req.query);

    if (typeof queryOptions === "string") {
      return next(new ErrorResponse(queryOptions, 200, "E500"));
    }

    /**
     * fetch paginated data using queryOptions
     */
    const objWithoutMeta = await helper.UserHelper.getMonthlyRrsCodes({
      month,
      year,
      queryOptions,
    });

    if (objWithoutMeta.data && !_.isEmpty(objWithoutMeta.data)) {
      /**
       * build response data meta for pagination
       */
      let url = req.protocol + "://" + req.get("host") + req.originalUrl;
      const obj = await utils.buildResponseMeta({ url, obj: objWithoutMeta });

      logger.filecheck(
        `INFO: route /monthlyRrs reached with month: ${month}, year: ${year}, _id: ${userId}, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );

      return utils.send_json_response({
        res,
        data: obj,
        msg: "Monthly rrscodes successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `Monthly rrscodes fetch failed with error ${error.message}`,
        200, // error.statusCode,
        error.errorCode
      )
    );
  }
});
