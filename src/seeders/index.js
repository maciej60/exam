
let seeder = require("mongoose-seed");
const mongoose = require("mongoose");
require("dotenv").config();
const utils = require("../utils");
const logger = require("../utils/logger");
let appRoot = require("app-root-path");
const generator = require("generate-password");
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
    let modelFileNameArray = await utils.getFileArray({
      path: normalizedPath,
      append: "",
      prepend: "",
      replace: { replace_from: ".js", replace_with: "" },
    });
    /*let modelFileNameArray = await utils.pascal_to_underscore(
      getModelFileNameArray
    );*/

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

    let pw_hashed = await utils.hashPassword("Password12@");

    /**
     * drop db and remove sticky constraints and unnecessary unique keys
     */
    await mongoose.connect(
      process.env.MONGO_URI,
      {
      },
      function () {
        mongoose.connection.db.dropDatabase();
      }
    );

    await seeder.connect(
      process.env.MONGO_URI,
      {
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
        model: "User",
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
            firstLogin: 2,
            password: pw_hashed,
            passwordResets: [pw_hashed]
          },
        ],
      },
      {
        model: "Module",
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
        model: "Business",
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
        model: "SchoolProgramme",
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
        model: "CandidateType",
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
        model: "QuestionType",
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
        model: "Grade",
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
        model: "Qualification",
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

