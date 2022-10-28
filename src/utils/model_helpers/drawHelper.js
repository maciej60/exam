
const fs = require("fs");
const _ = require("lodash");
const generator = require("generate-password");
const moment = require("moment");
const strings = require("locutus/php/strings");
const User = require("../../models/User");
const RrsCode = require("../../models/RrsCode");
const Reward = require("../../models/Reward");
const Receipt = require("../../models/Receipt");
const Draw = require("../../models/Draw");
const utils = require("..");
const time = new Date(Date.now()).toLocaleString();

module.exports = {
  updateDraw: async ({ filter: filter, update: update, options: options }) => {
    const updateDraw = await Draw.updateOne(filter, update, options);
    return updateDraw;
  },

  /* deleteDraw: async (ids) => {
    const deleteDraw = await Draw.deleteMany({ _id: { $in: ids } });
    return deleteDraw;
  }, */

  findUpsertDraw: async ({
    filter: filter,
    create: create,
    update: update,
    options: options,
  }) => {
    let action = "create";
    let res;
    let result;
    let get_draw = await Draw.findOne(filter);
    if (!get_draw) {
      res = await Draw.create(create);
    } else {
      res = await Draw.findOneAndUpdate(filter, update, options);
      action = "update";
    }
    let months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    result = res.toObject();
    if (result) {
      result.id = result._id;
      result.drawMonthText = months[result.drawMonth - 1];
    }
    return { result, action };
  },

  getDraw: async (data) => {
    const { where, params } = data;
    const v = Draw.aggregate([
      {
        $match: where,
      },
    ]).addFields({
      id: "$_id",
      shufflingFrequency: params.shufflingFrequency
        ? params.shufflingFrequency
        : 1,
      drawMonthText: {
        $function: {
          body: function (drawMonth) {
            let months = [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ];
            return months[drawMonth - 1];
          },
          args: ["$drawMonth"],
          lang: "js",
        },
      },
    });
    return v;
  },

  parseDrawCriteria: async ({ criteria, draw_month, draw_year }) => {
    let make_draw_date = await utils.getDateFromMonthYear(
      draw_year,
      draw_month
    );
    let rrs_code_month_year = await utils.getDateElemsUnpadded(make_draw_date);
    let amount_clause,
      receipt_date_clause,
      home_town_clause,
      user_type_clause,
      location_clause,
      item_name_clause,
      gender_clause,
      home_lga_clause,
      home_state_clause;
    let receipt_where = {};
    let rrs_code_where = {};
    rrs_code_where["rrsCodeStatus"] = 1;
    rrs_code_where["rrsCodeYear"] = rrs_code_month_year.year;
    rrs_code_where["rrsCodeMonth"] = rrs_code_month_year.month;
    if (criteria) {
      if (criteria.and) {
        if (criteria.and.amountRange) {
          let from,
            to = 0;
          from = criteria.and.amountRange.from || 0;
          to = criteria.and.amountRange.to || 0;
          if (to == 0 && from == 0) {
            amount_clause = {};
          } else if (to == 0 && from != 0) {
            amount_clause = {
              "rrs_code_receipts.receiptAmount": {
                $gte: parseFloat(from),
              },
            };
          } else if (to != 0 && from == 0) {
            amount_clause = {
              "rrs_code_receipts.receiptAmount": {
                $lte: parseFloat(to),
              },
            };
          } else {
            amount_clause = {
              "rrs_code_receipts.receiptAmount": {
                $gte: parseFloat(from),
                $lte: parseFloat(to),
              },
            };
          }
        }
        if (
          criteria.and.receiptDateBefore &&
          !_.isEmpty(criteria.and.receiptDateBefore)
        ) {
          draw_month_year = await utils.getFirstLastDateOfMonth(make_draw_date);
          receipt_date_clause = {
            "rrs_code_receipts.receiptDate": {
              $gte: new Date(draw_month_year.first),
              $lte: new Date(criteria.and.receiptDateBefore),
            },
          };
          let receipt_date_obj = null;
        }

        if (criteria.and.userType && _.isNumber(criteria.and.userType)) {
          user_type_clause = {
            "rrs_code_user.userType": criteria.and.userType,
          };
        }

        if (
          criteria.and.receiptItemName &&
          !_.isEmpty(criteria.and.receiptItemName)
        ) {
          item_name_clause = {
            "rrs_code_receipts.receiptItemName": {
              $in: criteria.and.receiptItemName,
            },
          };
        }
        // implement like, $options: 'i' makes it case insensitive
        if (criteria.and.location && !_.isEmpty(criteria.and.location)) {
          location_clause = {
            "rrs_code_user.homeAddress": {
              $regex: ".*" + criteria.and.location + ".*",
              $options: "i",
            },
          };
        }
        if (criteria.and.gender && !_.isEmpty(criteria.and.gender)) {
          gender_clause = {
            "rrs_code_user.gender": criteria.and.gender,
          };
        }
        if (criteria.and.homeState && !_.isEmpty(criteria.and.homeState)) {
          home_state_clause = {
            "rrs_code_user.homeState": { $in: criteria.and.homeState },
          };
        }
        if (criteria.and.homeLga && !_.isEmpty(criteria.and.homeLga)) {
          home_lga_clause = {
            "rrs_code_user.homeLga": { $in: criteria.and.homeLga },
          };
        }
        if (criteria.and.homeTown && !_.isEmpty(criteria.and.homeTown)) {
          home_town_clause = {
            "rrs_code_user.homeTown": { $in: criteria.and.homeTown },
          };
        }
      }
    }
    /* receipt_where["receipt_rrs_code.rrsCodeStatus"] = 1;
    receipt_where["receipt_rrs_code.rrsCodeYear"] = rrs_code_month_year.year;
    receipt_where["receipt_rrs_code.rrsCodeMonth"] = rrs_code_month_year.month; */
    if (!_.isEmpty(amount_clause)) {
      receipt_where["rrs_code_receipts.receiptAmount"] =
        amount_clause[Object.keys(amount_clause)[0]];
    }
    if (receipt_date_clause) {
      /* receipt_where["rrs_code_receipts.receiptDate"] = 
       receipt_date_clause[Object.keys(receipt_date_clause)[0]]; */
      receipt_date_obj = {
        from: draw_month_year.first,
        to: criteria.and.receiptDateBefore,
      };
    }
    if (user_type_clause) {
      rrs_code_where["rrs_code_user.userType"] =
        user_type_clause[Object.keys(user_type_clause)[0]];
    }
    if (item_name_clause) {
      receipt_where["rrs_code_receipts.receiptItemName"] =
        item_name_clause[Object.keys(item_name_clause)[0]];
    }
    if (location_clause) {
      rrs_code_where["rrs_code_user.homeAddress"] =
        location_clause[Object.keys(location_clause)[0]];
    }
    if (home_town_clause) {
      rrs_code_where["rrs_code_user.homeTown"] =
        home_town_clause[Object.keys(home_town_clause)[0]];
    }
    if (home_state_clause) {
      rrs_code_where["rrs_code_user.homeState"] =
        home_state_clause[Object.keys(home_state_clause)[0]];
    }
    if (home_lga_clause) {
      rrs_code_where["rrs_code_user.homeLga"] =
        home_lga_clause[Object.keys(home_lga_clause)[0]];
    }
    if (gender_clause) {
      rrs_code_where["rrs_code_user.gender"] =
        gender_clause[Object.keys(gender_clause)[0]];
    }
    return { receipt_where, rrs_code_where, receipt_date_obj };
  },

  selectWinners: async ({
    receipt_where,
    rrs_code_where,
    receipt_date_obj,
  }) => {
    if (receipt_date_obj) {
      let from = new Date(receipt_date_obj.from);
      let to = new Date(receipt_date_obj.to);
      receipt_where["rrs_code_receipts.receiptDate"] = {
        $gte: from,
        $lte: to,
      };
    }
    const v = RrsCode.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "rrs_code_user",
        },
      },
      {
        $match: rrs_code_where,
      },
      { $unwind: "$rrs_code_user" },
      {
        $lookup: {
          from: "receipts",
          localField: "_id",
          foreignField: "rrsCodeId",
          as: "rrs_code_receipts",
        },
      },
      {
        $match: receipt_where,
      },
      {
        $project: {
          __v: 0,
          //rrs_code_receipts: 0,
          receipts: 0,
          rrsCodeData: 0,
          "rrs_code_user.rrsCodes": 0,
          "rrs_code_user.password": 0,
          "rrs_code_user.passwordResets": 0,
          "rrs_code_user.userData": 0,
          "rrs_code_user.__v": 0,
        },
      },
    ]);
    return v;
  },

  getDraws: async (params) => {
    const { where, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    const result = Draw.paginate(where, options, function (err, results) {
      if (err) {
        console.log(err);
      } else {
        let months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        obj = results.data.map((item) => {
          item.id = item._id;
          item.drawMonthText = months[item.drawMonth - 1];
          return item;
        });
        results.data = obj;
        return results;
      }
    });
    return result;
  },
};