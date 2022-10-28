
const _ = require("lodash");
const moment = require("moment");
const strings = require("locutus/php/strings");
const RrsCode = require("../../models/RrsCode");
const Reward = require("../../models/Reward");
const Draw = require("../../models/Draw");
const utils = require("..");
const time = new Date(Date.now()).toLocaleString();

module.exports = {
  createDrawRewards: async ({ draw_id, data }) => {
    const create = await Reward.create(data);
    await Draw.findByIdAndUpdate(
      draw_id,
      { $push: { rewards: create._id } },
      { new: true }
    );
    return create;
  },

  getRewards: async (params) => {
    const { where, queryOptions } = params;
    const options = {
      ...queryOptions,
    };
    const v = Reward.aggregate([
      {
        $lookup: {
          from: "draws",
          localField: "drawId",
          foreignField: "_id",
          as: "rewards_draw",
        },
      },
      {
        $match: where,
      },
      { $unwind: "$rewards_draw" },
      {
        $project: {
          __v: 0,
          //rewards_draw: 0,
        },
      },
    ]).addFields({
      drawMonthYear: {
        $function: {
          body: function (drawMonth, drawYear) {
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
            return months[drawMonth - 1] + ", " + drawYear;
          },
          args: ["$rewards_draw.drawMonth", "$rewards_draw.drawYear"],
          lang: "js",
        },
      },
      rewardDate: {
        $function: {
          body: function (createdAt) {
            var date = new Date(createdAt);
            return date.toDateString();
          },
          args: ["$createdAt"],
          lang: "js",
        },
      },
    });
    const result = Reward.aggregatePaginate(
      v,
      options,
      function (err, results) {
        if (err) {
          console.log(err);
        } else {
          return results;
        }
      }
    );
    return result;
  },

  lockDraw: async (draw_id) => {
    const lock = await Draw.findByIdAndUpdate(
      draw_id,
      { drawStatus: 0 },
      { new: true }
    );
    return lock;
  },
};