const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const utils = require("../utils");
const helper = require("../utils/model_helpers");
const _ = require("lodash");
const logger = require("../utils/logger");
const { parseInt } = require("lodash");
const time = new Date(Date.now()).toLocaleString();

/**
 * report module
 */

/**
 * @desc rrscodes
 * @route GET /api/v2/report/rrscodes
 * @access PUBLIC
 *  @params userId
 */
exports.rrscodes = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;

    const isAdmin = await helper.UserHelper.isAdmin(userId);
    if (!isAdmin) {
      return next(new ErrorResponse(`You are not authorized!`, 200, "E401"));
    }

    let month, year, rrsCode, dateTo, dateFrom, status;
    let where = {};
    if (!_.isEmpty(req.query.month) && req.query.month) {
      month = parseInt(req.query.month);
      where.rrsCodeMonth = month;
    }
    if (!_.isEmpty(req.query.year) && req.query.year) {
      year = parseInt(req.query.year);
      where.rrsCodeYear = year;
    }
    if (!_.isEmpty(req.query.rrsCode) && req.query.rrsCode) {
      rrsCode = req.query.rrsCode;
      where.rrsCode = rrsCode;
    }
    if (!_.isEmpty(req.query.status) && req.query.status) {
      status = parseInt(req.query.status);
      where.rrsCodeStatus = status;
    }
    if (
      !_.isEmpty(req.query.dateTo) &&
      req.query.dateTo &&
      !_.isEmpty(req.query.dateFrom) &&
      req.query.dateFrom
    ) {
      dateTo = req.query.dateTo;
      dateFrom = req.query.dateFrom;
      where.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }
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
    const objWithoutMeta = await helper.ReportHelper.getRrsCodes({
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
        `INFO: route /rrscodes reached by _id: ${userId}, at ${time} with data ${JSON.stringify(
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


/**
 * @desc receipts
 * @route POST /api/v2/report/receipts
 * @access PUBLIC
 * @params userId
 */
exports.receipts = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;

    const isAdmin = await helper.UserHelper.isAdmin(userId);
    if (!isAdmin) {
      return next(new ErrorResponse(`You are not authorized!`, 200, "E401"));
    }

    let receiptAmount, receiptItemName, receiptNumber, dateTo, dateFrom, status;
    let where = {};
    if (!_.isEmpty(req.query.receiptAmount) && req.query.receiptAmount) {
      receiptAmount = parseFloat(req.query.receiptAmount);
      where.receiptAmount = receiptAmount;
    }
    if (!_.isEmpty(req.query.receiptNumber) && req.query.receiptNumber) {
      receiptNumber = req.query.receiptNumber;
      where.receiptNumber = receiptNumber;
    }
    if (!_.isEmpty(req.query.status) && req.query.status) {
      status = parseInt(req.query.status);
      where.receiptStatus = status;
    }
    if (!_.isEmpty(req.query.receiptItemName) && req.query.receiptItemName) {
      receiptItemName = req.query.receiptItemName;
      where.receiptItemName = {
        $regex: ".*" + receiptItemName + ".*",
        $options: "i",
      };
    }
    if (
      !_.isEmpty(req.query.dateTo) &&
      req.query.dateTo &&
      !_.isEmpty(req.query.dateFrom) &&
      req.query.dateFrom
    ) {
      dateTo = req.query.dateTo;
      dateFrom = req.query.dateFrom;
      where.receiptDate = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }
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
    const objWithoutMeta = await helper.ReportHelper.getReceipts({
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
        `INFO: route /receipts reached by _id: ${userId}, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );

      return utils.send_json_response({
        res,
        data: obj,
        msg: "RRS receipts successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `RRS receipts fetch failed with error ${error.message}`,
        200, // error.statusCode,
        error.errorCode
      )
    );
  }
});

/**
 * @desc users
 * @route POST /api/v2/report/users
 * @access PUBLIC
 * @params userId, taxId
 */
exports.users = asyncHandler(async (req, res, next) => {
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
    let phone, gender, taxId, email, name, dateTo, dateFrom, status, userType;
    let where = {};
    if (!_.isEmpty(req.query.userType) && req.query.userType) {
      userType = parseInt(req.query.userType);
      where.userType = userType;
    }
    if (!_.isEmpty(req.query.phone) && req.query.phone) {
      phone = req.query.phone;
      where.phone = phone;
    }
    if (!_.isEmpty(req.query.gender) && req.query.gender) {
      gender = req.query.gender;
      where.gender = gender;
    }
    if (!_.isEmpty(req.query.taxId) && req.query.taxId) {
      taxId = req.query.taxId;
      where.taxId = taxId;
    }
    if (!_.isEmpty(req.query.email) && req.query.email) {
      email = req.query.email;
      where.email = email;
    }
    if (!_.isEmpty(req.query.name) && req.query.name) {
      name = req.query.name;
      where.userName = {
        $regex: ".*" + name + ".*",
        $options: "i",
      };
    }
    if (!_.isEmpty(req.query.status) && req.query.status) {
      status = parseInt(req.query.status);
      where.userStatus = status;
    }
    if (
      !_.isEmpty(req.query.dateTo) &&
      req.query.dateTo &&
      !_.isEmpty(req.query.dateFrom) &&
      req.query.dateFrom
    ) {
      dateTo = req.query.dateTo;
      dateFrom = req.query.dateFrom;
      where.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }
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
    const objWithoutMeta = await helper.ReportHelper.getUsers({
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
        `INFO: route /users reached with _id: ${userId}, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );

      return utils.send_json_response({
        res,
        data: obj,
        msg: "Users successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `Users fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});


