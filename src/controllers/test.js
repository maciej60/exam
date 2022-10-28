const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const fs = require("fs");
const path = require("path");
//const db = require("../models");
const bcrypt = require("bcryptjs");
const utils = require("../utils");
const _ = require("lodash");
const logger = require("../utils/logger");
const generator = require("generate-password");
/* const EnrollStates = require("../models/EnrollStates");
const AdminPermission = require("../models/AdminPermission"); */
let appRoot = require("app-root-path");
const helper = require("../utils/model_helpers");



/**
 * @desc Login Admin
 * @route POST /api/auth/login
 * @access PUBLIC
 */

exports.start = asyncHandler(async (req, res, next) => {
  let obj;
  /**
   * test utils.getFileArray returns array of files ending with extension if replace object children has empty values
   */
  /* 
  var normalizedPath = appRoot + '/src/models/';
  const fileArray = await utils.getFileArray({
    path: normalizedPath,
    append: normalizedPath,
    prepend: "",
    replace: { replace_from: "", replace_with: "" },
  });
  obj = fileArray;
  */

  /**
   * test utils.getFileArray returns array of file names with no extension if replace object children has strings to replace
  /* 
  const fileNameArray = await utils.getFileArray({
    path: normalizedPath,
    append: "",
    prepend: "",
    replace: { replace_from: ".js", replace_with: "s" },
  });
  obj = fileNameArray;
*/

  /**
   * test utils.pascal_to_underscore
   */
  /* 
  const obj = await utils.pascal_to_underscore('ArrayTo');
  assert that obj = 'array_to'
   */

  /**
   * test email send
   */
  /*   
let appRoot = require("app-root-path");
   let emailTemplate = require(`${appRoot}/src/utils/emailTemplate`);
  let params = {
    heading: "Your RRS account created & monthly RRS code successfully generated",
    email: "pcollinsmb@gmail.com",
    password: "password",
    message: "Revenue reward scheme (RRS) is a program designed to reward tax payers. At every month-end, a draw is made where the lucky tax-payers are provided with a reward.",
    rrsCode: "WYTWYTYTWEY65656"
  };
  const obj = await utils.send_email_api({
    to: params.email,
    message: emailTemplate.rrsCode(params),
    subject: "Revenue reward scheme",
  });
  */

  /**
   * test get current monthname and year
   */
  /* obj = await utils.getDateElemsText(Date.now()); 
 obj = obj.month + ", " + obj.year; */

  /**
   * test get current month and year
   */
  /* obj = await utils.getDateElems(Date.now()); 
 obj = obj.month + ", " + obj.year; */

  /**
   * test mongoose valid objectId
   */
  /* var mongoose = require("mongoose");
  let s = "microsoft123";
  var isValid = mongoose.Types.ObjectId("microsoft123") == s;
  let s = "551137c2f9e1fac808a5f572";
  var isValid = mongoose.Types.ObjectId("551137c2f9e1fac808a5f572") == s;
  console.log(isValid); */

  /**
   * test get first and last date of month
   */
  /* 
  obj = await utils.getFirstLastDateOfMonth("2021-06-10");
  console.log(obj);
  "obj": {
            "first": "2021-06-01 12:00",
            "last": "2021-06-30 11:59"
        }
  */

  /**
   * test select criteria build
   */

  /* let criteria = {
    and: {
      amountRange: { from: 10000, to: 30000 },
      userType: 1,
      location: ["awka", "onitsha"],
      receiptDateBefore: "2021-06-20",
    },
    or: {
      amountRange: { from: 10000, to: 30000 },
      userType: 1,
      location: ["awka", "onitsha"],
      receiptDateBefore: "2021-06-20",
    },
  };

"drawCriteria": {
                "and": {
                    "amountRange": {
                        "from": 0,
                        "to": 0
                    },
                    "userType": "",
                    "location": [],
                    "receiptDateBefore": "2021-08-15T08:00:35.190Z",
                    "receiptItemName": [],
                    "gender": "",
                    "homeState": [],
                    "homeLga": [],
                    "homeTown": []
                }
            },

  draw_month = 6;
  draw_year = 2021;

  let get_parsed_criteria = await helper.DrawHelper.parseDrawCriteria({
    criteria,
    draw_month,
    draw_year,
  });
  obj = await helper.DrawHelper.selectWinners({
    receipt_where: get_parsed_criteria.receipt_where,
    rrs_code_where: get_parsed_criteria.rrs_code_where,
  }); */

  /* 
  console.log(get_parsed_criteria);
  {
    receipt_where: {
      'receipt_rrs_code.rrsCodeStatus': 1,
      'receipt_rrs_code.rrsCodeYear': 2021,
      'receipt_rrs_code.rrsCodeMonth': 6,
      receiptAmount: { '$gte': 10000, '$lte': 30000 },
      receiptDate: {
        '$gte': 2021-06-01T11:00:00.000Z,
        '$lte': 2021-06-20T00:00:00.000Z
      }
    },
    rrs_code_where: {
      'rrs_code_user.userType': 1,
      'rrs_code_user.location': { '$in': [Array] }
    }
  } 
  console.log(obj);
  [
  {
    _id: 60d33c6c97bb423a0c12e4b5,
    receiptAmount: 23000.66,
    receiptStatus: 1,
    rrsCodeId: 60ce0f9031a494a061f51b84,
    receiptNumber: '009op98887up6oop',
    receiptDate: 2021-06-11T00:00:00.000Z,
    receiptEnteredOn: 2021-06-23T13:51:40.613Z,
    receipt_rrs_code: {
      rrsCodeStatus: 1,
      userId: 60ce0f9031a494a061f51b83,
      rrsCode: 'VAYFSTSP062021',
      rrsCodeMonth: 6,
      rrsCodeYear: 2021,
      rrsCodeEnteredOn: 2021-06-19T15:38:56.172Z
    },
    rrs_code_user: {
      isAdmin: 0,
      userStatus: 1,
      taxId: '6545645454',
      lastName: 'DIM',
      firstName: 'CHUKWU',
      middleName: 'NGOZI',
      companyName: '',
      email: 'dimngozichukwu3@gmail.com',
      phone: '08136587946',
      location: 'awka',
      userType: 1,
      userEnteredOn: 2021-06-19T15:38:56.156Z,
      project: 'imostate.tax'
    }
  }
]
*/

  /* let arr = [
  {
    a: 1,
    b: 2,
  },
  {
    c: 3,
    d: 4,
  },
  {
    e: 5,
    f: 6,
  },
  {
    g: 7,
    h: 8,
  },
  {
    i: 9,
    j: 10,
  },
];
obj = await utils.pickFromShuffledArray(arr, 10, 2); */
obj = await helper.RrsCodeHelper.generateRRS();
  console.log(obj);
  let robj = {
    status: "test",
    code: "T1O",
    message: `testing...!`,
    data: { obj },
  };
  return res.status(200).json(robj);
});
