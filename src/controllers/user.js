const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const utils = require("../utils");
const helper = require("../utils/model_helpers");
const _ = require("lodash");
const logger = require("../utils/logger");
const { parseInt } = require("lodash");
const time = new Date(Date.now()).toLocaleString();

/**
 * @desc taxPayersFromRevotax
 * @route POST /api/v2/user/taxPayersFromRevotax
 * @access PUBLIC
 *  @params apikey, ip, receipt_no
 */
exports.taxPayersFromRevotax = asyncHandler(async (req, res, next) => {
  try {
    let ip = req.socket.remoteAddress;
    let { data } = req.body;
    const createResponse = (data) => {
      return res.status(200).json({
        status: data.status,
        code: "00",
        data: {
          success: data.successful,
          failed: data.failed,
        },
        message: data.message,
      });
    }
    if(!data || !data.length) {
      return next(
        new ErrorResponse(
          `Please provide data!`,
          200,
          "E301"
        )
      );
    }
    await helper.UserHelper.createTaxPayerFromRevotax(
      data,
      createResponse
    );
  } catch (error) {
    return next(
      new ErrorResponse(
        `TaxpayerFromRevotax failed with error ${error.message}`,
        500,
        error.errorCode
      )
    );
  }
});

/**
 * @desc Users
 * @route POST /api/v2/user/add
 * @access PUBLIC
 */
exports.add = asyncHandler(async (req, res, next) => {
  try {
    let createdBy = req.user.id;
    let { phone, email, lastName, firstName, middleName, taxId } =
      req.body;
    const ObjectId = require("mongoose").Types.ObjectId;
    /**
     * drawCriteria: receipts.receiptItemName, receipts.receiptDate before, users.userType, receipts.receiptAmount range
     */
    let user_data = {
      phone,
      email,
      lastName,
      firstName,
      middleName,
      taxId,
      isAdmin: 1,
      userType: 1,
      gender: "Male"
    };
    const create_user = await helper.UserHelper.createUser(user_data);
    logger.filecheck(
      `INFO: Admin user created: by ${createdBy} at ${time} with data ${JSON.stringify(
        create_user
      )} \n`
    );
    return utils.send_json_response({
      res,
      data: create_user,
      msg: "User successfully created",
    });
  } catch (error) {
    return next(
      new ErrorResponse(
        `User create failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc userRrs
 * @route GET /api/v2/user/userRrs
 * @access PUBLIC
 *  @params userId, taxId
 */
exports.userRrs = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    let taxId = req.user.taxId;

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
    const objWithoutMeta = await helper.UserHelper.getUserRrsCodes({
      taxId,
      queryOptions,
    });

    if (objWithoutMeta.data && !_.isEmpty(objWithoutMeta.data)) {
      /**
       * build response data meta for pagination
       */
      let url = req.protocol + "://" + req.get("host") + req.originalUrl;
      const obj = await utils.buildResponseMeta({ url, obj: objWithoutMeta });

      logger.filecheck(
        `INFO: route /userRrscode reached with tax_id: ${taxId}, _id: ${userId}, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );

      return utils.send_json_response({
        res,
        data: obj,
        msg: "User rrscodes successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `User rrscodes fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc userTotalMonthlyReceipts
 * @route POST /api/v2/user/userTotalMonthlyReceipts
 * @access PUBLIC
 *  @params userId, taxId, month, year
 */
exports.userTotalMonthlyReceipts = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    let taxId = req.user.taxId;
    let { month, year } = req.body;
    month = parseInt(month);
    year = parseInt(year);
    const obj = await helper.UserHelper.getUserTotalMonthlyReceipts({
      taxId,
      month,
      year,
    });
    logger.filecheck(
      `INFO: route /userTotalMonthlyReceipts reached with tax_id: ${taxId}, _id: ${userId}, at ${time} with data ${JSON.stringify(
        obj
      )} \n`
    );
    if (obj && !_.isEmpty(obj)) {
      return utils.send_json_response({
        res,
        data: obj,
        msg: "User Total Monthly Receipts successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `User Total Monthly Receipts fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc userHighestReceipt
 * @route POST /api/v2/user/userHighestReceipt
 * @access PUBLIC
 *  @params userId, taxId
 */
exports.userHighestReceipt = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    let taxId = req.user.taxId;
    const obj = await helper.UserHelper.getUserHighestReceipt({
      taxId,
    });
    logger.filecheck(
      `INFO: route /userHighestReceipt reached with tax_id: ${taxId}, _id: ${userId}, at ${time} with data ${JSON.stringify(
        obj
      )} \n`
    );
    if (obj && !_.isEmpty(obj)) {
      return utils.send_json_response({
        res,
        data: obj,
        msg: "User Highest Receipt successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `User highest Receipt fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc userStats
 * @route POST /api/v2/user/userStats
 * @access PUBLIC
 *  @params userId, taxId, month, year
 */
exports.userStats = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    let taxId = req.user.taxId;
    let { month, year } = req.body;
    month = parseInt(month);
    year = parseInt(year);
    const userTotalCurrentMonthReceipts =
      await helper.UserHelper.getUserTotalMonthlyReceipts({
        taxId,
        month,
        year,
      });
    const userMonthlyReceiptCount =
      await helper.UserHelper.getUserMonthlyReceiptCount({
        taxId,
        month,
        year,
      });
    const userRrsCodesCount = await helper.UserHelper.getUserRrsCodesCount({
      taxId
    });
    const userHighestReceipt = await helper.UserHelper.getUserHighestReceipt(
      {
        taxId,
      }
    );
    const userCurrentMonthYearRrsCode = await helper.UserHelper.getUserMonthYearRrs(
      {
        $and: [
          { userId: userId },
          { rrsCodeMonth: month },
          { rrsCodeYear: year },
        ],
      },
      { rrsCode: 1, _id: 0 }
    );
    let obj = {
      userTotalCurrentMonthReceipts,
      userHighestReceipt,
      userCurrentMonthYearRrsCode,
      userMonthlyReceiptCount,
      userRrsCodesCount,
    };
    logger.filecheck(
      `INFO: route /userStats reached with tax_id: ${taxId}, _id: ${userId}, at ${time} with data ${JSON.stringify(
        obj
      )} \n`
    );
    if (obj && !_.isEmpty(obj)) {
      return utils.send_json_response({
        res,
        data: obj,
        msg: "User Stats successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `User Stats fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc userStats
 * @route POST /api/v2/user/userItems
 * @access PUBLIC
 *  @params userId, taxId, where, fields
 */
exports.userItems = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    let taxId = req.user.taxId;
    let { model, where, fields } = req.body;
    if (!where) {
      return next(
        new ErrorResponse(
          "Provide query where param object like so: {'email': 'pcollinsmb@gmail.com'} or {}",
          200,
          "E500"
        )
      );
    }
    if (!(fields) || _.isEmpty(fields)) {
      return next(
        new ErrorResponse(
          "Provide query fields array like so: ['email', 'phone', 'homeState']",
          200,
          "E500"
        )
      );
    }
    let obj = {};
    if (fields.length > 1) { 
      const fields_obj = {};
      _.forEach(fields, function (value) {
        fields_obj[value] = 1;
      });
      fields_obj["_id"] = 0;
      obj = await helper.UserHelper.getUserItemsMultipleFieldsUsingQuery({
        model: model || "",
        where,
        fields: fields_obj,
      });
    } else {
      obj = await helper.UserHelper.getUserItemsSingleFieldsUsingDistinct({
        model: model || "",
        where,
        fields: fields[0],
      });
    }
    logger.filecheck(
      `INFO: route /userItems reached with tax_id: ${taxId}, _id: ${userId}, at ${time} with data ${JSON.stringify(
        obj
      )} \n`
    );
    if (obj && !_.isEmpty(obj)) {
      return utils.send_json_response({
        res,
        data: obj,
        msg: "User items successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `User items fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});


/**
 * @desc userMonthYearRrs
 * @route POST /api/v2/user/userMonthYearRrs
 * @access PUBLIC
 *  @params userId, taxId, month, year
 */
exports.userMonthYearRrs = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    let taxId = req.user.taxId;
    let { month, year } = req.body;
    month = parseInt(month);
    year = parseInt(year);
    const obj = await helper.UserHelper.getUserMonthYearRrs(
      {
        $and: [
          { userId: userId },
          { rrsCodeMonth: month },
          { rrsCodeYear: year },
        ],
      },
      { rrsCode: 1, _id: 0 }
    );
    logger.filecheck(
      `INFO: route /userMonthYearRrs reached with tax_id: ${taxId}, _id: ${userId}, at ${time} with data ${JSON.stringify(
        obj
      )} \n`
    );
    if (obj && !_.isEmpty(obj)) {
      return utils.send_json_response({
        res,
        data: obj,
        msg: "User Month Year Rrs successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `User Month Year Rrs fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc userReceipts
 * @route POST /api/v2/user/userReceipts
 * @access PUBLIC
 * @params userId, taxId
 */
exports.userReceipts = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    let taxId = req.user.taxId;

    if (_.isEmpty(req.query)) {
      return next(
        new ErrorResponse(
          "Provide query params like sort, page and per_page",
          200,
          "E500"
        )
      );
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
    const objWithoutMeta = await helper.UserHelper.getUserReceipts({
      taxId,
      queryOptions,
    });

    if (objWithoutMeta.data && !_.isEmpty(objWithoutMeta.data)) {
      /**
       * build response data meta for pagination
       */
      let url = req.protocol + "://" + req.get("host") + req.originalUrl;
      const obj = await utils.buildResponseMeta({ url, obj: objWithoutMeta });

      logger.filecheck(
        `INFO: route /userReceipts reached with tax_id: ${taxId}, _id: ${userId}, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );

      return utils.send_json_response({
        res,
        data: obj,
        msg: "User receipts successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `User receipts fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc userRewards
 * @route POST /api/v2/user/userRewards
 * @access PUBLIC
 * @params userId, taxId
 */
exports.userRewards = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    let taxId = req.user.taxId;
    const obj = await helper.UserHelper.getUserRewards(taxId);
    logger.filecheck(
      `INFO: route /userRewards reached with tax_id: ${taxId}, _id: ${userId}, at ${time} with data ${JSON.stringify(
        obj
      )} \n`
    );
    if (obj && !_.isEmpty(obj)) {
      return utils.send_json_response({
        res,
        data: obj,
        msg: "User rewards successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `User rewards fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * admin module
 */

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
    month =  _.isEmpty(month) || month == null
       ? (parseInt(currDayMonthYear.month))
       : parseInt(month);
    year =  _.isEmpty(year) || year == null
       ? (parseInt(currDayMonthYear.year))
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

/**
 * @desc adminStats
 * @route POST /api/v2/admin/adminStats
 * @access PUBLIC
 *  @params userId, taxId, month, year
 */
exports.adminStats = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;

    const isAdmin = await helper.UserHelper.isAdmin(userId);
    if (!isAdmin) {
      return next(new ErrorResponse(`You are not authorized!`, 200, "E401"));
    }

    let { month, year } = req.body;
    month = parseInt(month);
    year = parseInt(year);

    /**
     * this returns aggregate of month/year single set containing total and count
     */
    let currentMonthReceiptsAggregate_where = {
      "receipt_rrs_code.rrsCodeStatus": 1,
      "receipt_rrs_code.rrsCodeMonth": month,
      "receipt_rrs_code.rrsCodeYear": year,
    };
    const currentMonthReceiptsAggregate =
      await helper.UserHelper.getMonthlyReceiptsAggregate({
        receipt_where: currentMonthReceiptsAggregate_where,
      });

    /**
     * this returns aggregate of month/year arrays containing total and count for each set
     */
    let allMonthReceiptsAggregate_where = {
      "receipt_rrs_code.rrsCodeStatus": 1,
    };
    const allMonthReceiptsAggregate =
      await helper.UserHelper.getMonthlyReceiptsAggregate({
        receipt_where: allMonthReceiptsAggregate_where,
      });

    /**
     * this returns aggregate of rrsCode/month/year single set containing total and count
     */
    let currentMonthRrsReceiptsAggregate_where = {
      "receipt_rrs_code.rrsCodeStatus": 1,
      "receipt_rrs_code.rrsCodeMonth": month,
      "receipt_rrs_code.rrsCodeYear": year,
    };
    const currentMonthRrsReceiptsAggregate =
      await helper.UserHelper.getMonthlyRrsReceiptsAggregate({
        receipt_where: currentMonthRrsReceiptsAggregate_where,
      });

    /**
     * this returns aggregate of rrsCode/month/year arrays containing total and count for each set
     */
    let allMonthRrsReceiptsAggregate_where = {
      "receipt_rrs_code.rrsCodeStatus": 1,
    };
    const allMonthRrsReceiptsAggregate =
      await helper.UserHelper.getMonthlyRrsReceiptsAggregate({
        receipt_where: allMonthRrsReceiptsAggregate_where,
      });

    const monthlyRrsCodesCount =
      await helper.UserHelper.getMonthlyRrsCodesCount({
        month,
        year,
      });

    const totalUserCount =
      await helper.UserHelper.getTotalUserCount();

    /**
     * this returns overall top Highest Receipts for limit 5,
     * resultset contains receipt data, receipt_rrs data and rrs_user data for all months inclusive
     */
    let allTopHighestReceipts_where = {
      "receipt_rrs_code.rrsCodeStatus": 1,
    };
    const allTopHighestReceiptsAggregate =
      await helper.UserHelper.getTopMonthlyHighestReceipts({
        receipt_where: allTopHighestReceipts_where,
        limit: 5,
      });

    /**
     * this returns top Monthly Highest Receipts for limit 5,
     * resultset contains receipt data, receipt_rrs data and rrs_user data
     */
    let topMonthlyHighestReceipts_where = {
      "receipt_rrs_code.rrsCodeStatus": 1,
      "receipt_rrs_code.rrsCodeMonth": month,
      "receipt_rrs_code.rrsCodeYear": year,
    };
    const topMonthlyHighestReceiptsAggregate =
      await helper.UserHelper.getTopMonthlyHighestReceipts({
        receipt_where: topMonthlyHighestReceipts_where,
        limit: 5,
      });

    let topMonthlyLeastReceipts_where = {
        "receipt_rrs_code.rrsCodeStatus": 1,
        "receipt_rrs_code.rrsCodeMonth": month,
        "receipt_rrs_code.rrsCodeYear": year,
    };
    const topMonthlyLeastReceiptsAggregate =
      await helper.UserHelper.getTopMonthlyLeastReceipts({
        receipt_where: topMonthlyLeastReceipts_where,
        limit: 1,
      });

    let obj = {
      totalUserCount,
      topMonthlyHighestReceiptsAggregate,
      topMonthlyLeastReceiptsAggregate,
      allMonthReceiptsAggregate,
      currentMonthReceiptsAggregate,
      allMonthRrsReceiptsAggregate,
      currentMonthRrsReceiptsAggregate,
      allTopHighestReceiptsAggregate,
      monthlyRrsCodesCount,
    };
    logger.filecheck(
      `INFO: route /adminStats reached with month: ${month}, year: ${year}, _id: ${userId}, at ${time} with data ${JSON.stringify(
        obj
      )} \n`
    );
    if (obj && !_.isEmpty(obj)) {
      return utils.send_json_response({
        res,
        data: obj,
        msg: "Admin Stats successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `Admin Stats fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});


/**
 * @desc adminTopMonthReceipts
 * @route POST /api/v2/admin/adminTopMonthReceipts
 * @access PUBLIC
 * @params userId, taxId
 */
exports.adminTopMonthReceipts = asyncHandler(async (req, res, next) => {
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

    let { month, year } = req.query;
    const currDayMonthYear = await utils.currDayMonthYear();
    month =
      _.isEmpty(month) || month == null
        ? parseInt(currDayMonthYear.month)
        : parseInt(month);
    year =
      _.isEmpty(year) || year == null
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
    const objWithoutMeta = await helper.UserHelper.adminTopMonthReceipts({
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
        `INFO: route /adminTopMonthReceipts reached with month: ${month}, year: ${year}, _id: ${userId}, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );

      return utils.send_json_response({
        res,
        data: obj,
        msg: "Admin Top Month Receipts successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `Admin Top Month Receipts fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});

/**
 * @desc users
 * @route POST /api/v2/admin/users
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

    /**
     * build query options for mongoose-paginate
     */
    const queryOptions = await utils.buildQueryOptions(req.query);
    let where = {};

    if (typeof queryOptions === "string") {
      return next(new ErrorResponse(queryOptions, 200, "E500"));
    }

    /**
     * fetch paginated data using queryOptions
     */
    const objWithoutMeta = await helper.UserHelper.getUsersPaginated({
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


