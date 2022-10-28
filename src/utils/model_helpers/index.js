module.exports = {
  RrsCodeHelper: require("./rrsCodeHelper"),
  UserHelper: require("./userHelper"),
  ReceiptHelper: require("./receiptHelper"),
  UssdLogHelper: require("./ussdLogHelper"),
  SmsLogHelper: require("./smsLogHelper"),
  EmailLogHelper: require("./emailLogHelper"),
  DrawHelper: require("./drawHelper"),
  RewardHelper: require("./rewardHelper"),
  ReportHelper: require("./reportHelper"),
};

/* var normalizedPath = require("path").join(__dirname, "routes");

require("fs")
  .readdirSync(normalizedPath)
  .forEach(function (file) {
    require("./routes/" + file);
  }); */
