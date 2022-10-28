const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const utils = require("../utils");
const helper = require("../utils/model_helpers");
const _ = require("lodash");
const logger = require("../utils/logger");
const time = new Date(Date.now()).toLocaleString();
const shufflingFrequency = utils.getShufflingFrequency();

/**
 * @desc rewards
 * @route GET /api/v2/reward/fetch
 * @access PUBLIC
 *  @params userId, month, year, drawId
 */
exports.fetch = asyncHandler(async (req, res, next) => {
  try {
    let userId = req.user.id;
    let { month, year } = req.body;
    if (!month || !year) {
      month = req.query.month;
      year = req.query.year;
    }
    if(month) month = parseInt(month);
    if(year) year = parseInt(year);

    if (!req.query.page || !req.query.per_page) {
      return next(
        new ErrorResponse(
          "Provide query params like sort, page and per_page",
          200,
          "E500"
        )
      );
    }
    let queryOptions = await utils.buildQueryOptions(req.query);
    if (typeof queryOptions === "string") {
      return next(new ErrorResponse(queryOptions, 200, "E500"));
    }

    /**
     * build where
     */
    let where = {};
    if (req.body.drawId) {
      drawId = req.body.drawId;
    } else {
      drawId = req.query.drawId;
    }
    if (drawId) {
      const ObjectId = require("mongoose").Types.ObjectId;
      where = { drawId: new ObjectId(drawId) };
    } else {
      if(month && year){
        where = {
          "rewards_draw.drawMonth": month,
          "rewards_draw.drawYear": year,
          "rewards_draw.drawStatus": 0,
        };
      }
    }
    const objWithoutMeta = await helper.RewardHelper.getRewards({
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
        `INFO: route /rewards reached with _id: ${userId}, at ${time} with data ${JSON.stringify(
          obj
        )} \n`
      );
      return utils.send_json_response({
        res,
        data: obj,
        msg: "Monthly rewards successfully fetched",
      });
    } else {
      return next(new ErrorResponse(`No record!`, 200, "E404"));
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `Monthly rewards fetch failed with error ${error.message}`,
        200,
        error.errorCode
      )
    );
  }
});
