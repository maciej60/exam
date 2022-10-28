
var seeder = require("mongoose-seed");
const mongoose = require("mongoose");
require("dotenv").config();
const utils = require("../utils");
const logger = require("../utils/logger");
let appRoot = require("app-root-path");
var normalizedPath = appRoot + "/src/models/";

console.log('seeding started...');
(async () => {
  try {
    let modelFileArray = await utils.getFileArray({
      path: normalizedPath,
      append: normalizedPath,
      prepend: "",
      replace: { replace_from: "", replace_with: "" },
    });
    let getModelFileNameArray = await utils.getFileArray({
      path: normalizedPath,
      append: "",
      prepend: "",
      replace: { replace_from: ".js", replace_with: "s" },
    });
    modelFileNameArray = await utils.pascal_to_underscore(
      getModelFileNameArray
    );

    logger.filecheck(
      `INFO: Seeder ran with modelFileArray: ${JSON.stringify(
        modelFileArray
      )} \n`
    );
    logger.filecheck(
      `INFO: Seeder ran with modelFileNameArray: ${JSON.stringify(
        modelFileNameArray
      )} \n`
    );

    /**
     * drop db and remove sticky constraints and unnecessary unique keys
     */
    mongoose.connect(
      process.env.MONGO_URI,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      },
      function () {
        mongoose.connection.db.dropDatabase();
      }
    );

    seeder.connect(
      process.env.MONGO_URI,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      },
      function () {
        seeder.loadModels(modelFileArray);
        seeder.clearModels(modelFileNameArray, function () {
          seeder.populateModels(data, function () {
            seeder.disconnect();
          });
        });
      }
    );

    let data = [
      {
        model: "users",
        documents: [
          {
            taxId: "1234567890",
            lastName: "OBI",
            firstName: "PAUL",
            middleName: "COLLINS",
            companyName: "",
            email: "pcollinsmb@gmail.com",
            phone: "07053321512",
            project: "Admin",
            userType: 1,
            userData: {},
            isAdmin: 1,
            homeLga: "aguata",
            homeState: "anambra",
            homeTown: "isuofia",
            homeAddress: "6 festac street",
            gender: "male",
            paymentMethod: "",
            depositorSlipNumber: "",
            agentType: "PAYE",
            occupation: "admin",
          },
        ],
      },
    ];
  } catch (error) {
    console.log(error);
  }
})();

