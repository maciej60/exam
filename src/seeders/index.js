
let seeder = require("mongoose-seed");
const mongoose = require("mongoose");
require("dotenv").config();
const utils = require("../utils");
const logger = require("../utils/logger");
let appRoot = require("app-root-path");
let normalizedPath = appRoot + "/src/models/";

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
    let modelFileNameArray = await utils.pascal_to_underscore(
      getModelFileNameArray
    );

    await logger.filecheck(
      `INFO: Seeder ran with modelFileArray: ${JSON.stringify(
        modelFileArray
      )} \n`
    );
    await logger.filecheck(
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
            userName: "admin",
            lastName: "OBI",
            firstName: "PAUL",
            middleName: "COLLINS",
            email: "pcollinsmb@gmail.com",
            phone: "08068535539",
            isAdmin: 1,
            status: 1,
            firstLogin: 2
          },
        ],
      },
      {
        model: "modules",
        documents: [
          {
            name: "WORKFLOW",
          },
          {
            name: "LMS",
          },
          {
            name: "EXAM",
          },
          {
            name: "REPORT",
          },
        ],
      },
      {
        model: "business",
        documents: [
          {
            name: "GLOBAL",
            email: "pcollinsmb@gmail.com",
            phone: "08068535539",
            address: "FCT",
          }
        ],
      },
      {
        model: "school_programmes",
        documents: [
          {
            name: "UNDERGRADUATE",
          },
          {
            name: "POST-GRADUATE",
          },
          {
            name: "PART-TIME",
          },
          {
            name: "NCE",
          },
          {
            name: "SECONDARY",
          },
          {
            name: "PRIMARY",
          },
          {
            name: "POLYTECHNIC",
          }
        ],
      },
      {
        model: "candidate_types",
        documents: [
          {
            name: "EMPLOYEE",
          },
          {
            name: "STUDENT",
          }
        ],
      },
      {
        model: "question_types",
        documents: [
          {
            name: "OBJECTIVE",
          },
          {
            name: "ESSAY",
          },
          {
            name: "MULTI-ANSWER",
          }
        ],
      },
      {
        model: "grades",
        documents: [
          {
            name: "First Class",
          },
          {
            name: "Second Class Upper",
          },
          {
            name: "Second Class Lower",
          },
          {
            name: "Pass",
          },
          {
            name: "Distinction",
          },
          {
            name: "Third Class",
          }
        ],
      },
      {
        model: "qualifications",
        documents: [
          {
            name: "Diploma",
          },
          {
            name: "B.Ed",
          },
          {
            name: "M.B.B.S",
          },
          {
            name: "JSCE",
          },
          {
            name: "SSCE",
          },
          {
            name: "FSLC",
          },
          {
            name: "M.Sc",
          },
          {
            name: "B.Sc",
          },
          {
            name: "Ph.D",
          }
        ],
      },
    ];
  } catch (error) {
    console.log(error);
  }
})();

