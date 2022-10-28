const asyncHandler = require("../middleware/async");
const { validate } = require("validate.js");
const axios = require("axios");
const utils = require("../utils");
const helper = require("../utils/model_helpers");
const _ = require("lodash");
const logger = require("../utils/logger");
let appRoot = require("app-root-path");
let emailTemplate = require(`${appRoot}/src/utils/emailTemplate`);
const time = new Date(Date.now()).toLocaleString();
const generator = require("generate-password"); 

exports.jobCaller = asyncHandler(async (req, res, next) => {
  try {
    const setJob = await utils.jobQueue({
      exchange: process.env.RABBIT_EXCHANGE_NAME,
      queue: process.env.RABBIT_QUEUE_NAME,
      rkey: process.env.RABBIT_RKEY_NAME,
      msg: JSON.stringify({
        receipt_no: "test receipt",
      }),
    });
    return res.status(200).json(setJob);
  } catch (error) {
    console.log(error);
  }
});

exports.jobExecutor = asyncHandler(async (req, res, next) => {
  try {
    const doJob = await utils.jobExec({
      queue: process.env.RABBIT_QUEUE_NAME,
    });
    return res.status(200).json(doJob);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @desc get rrs_code after receipt verification
 * @route POST /api/v2/ussd/getrrs
 * @access PUBLIC
 * USSD *347*144#
 */

exports.getrrs = asyncHandler(async (req, res, next) => {
  try {
    /**
     * initialize key variables
     */
    let currMonthYear = await utils.getDateElemsText(Date.now());
    currMonthYear = currMonthYear.month + ", " + currMonthYear.year;
    const currDayMonthYear = await utils.currDayMonthYear();
    console.log(`\n\n*** getting variables ***`);
    console.log(`*** currMonthYear: ${currMonthYear} ***`);

    /**
     * build contraints for validate.js
     */
    const constraints = {
      receipt_no: {
        presence: {
          allowEmpty: false,
          message: " is required",
        },
        length: {
          minimum: 8,
          maximum: 20,
          message: " must be between 8 and 20 characters",
        },
      },
      projectCode: {
        presence: {
          allowEmpty: false,
          message: " is required",
        },
        length: {
          minimum: 3,
          maximum: 3,
          message: " must be 3 characters",
        },
      },
    };
    /**
     * destructure the request body and pick the needed params
     */
    let { text, phoneNumber, sessionId, networkCode, serviceCode } = req.body;
    console.log("*** user request body: ***");
    console.log(req.body);
    let response = "";
    //console.log((text.match(new RegExp("0", "g")) || []).length);
    //console.log(text.split("*").length - 1);
    textObj = text.split("*");
    if (_.isEmpty(text) || (text == "*")) {
      response = "CON Provide project code e.g. 301: \n";
      return utils.send_response(res, response);
    }
    if (
      (!_.isEmpty(text) && text.indexOf("*") <= -1) ||
      (textObj.length - 1 == 0 && !_.isEmpty(textObj[0])) ||
      (textObj.length - 1 == 1 && _.isEmpty(textObj[1]))
    ) {
      response = "CON Provide receipt number: \n";
      return utils.send_response(res, response);
    }
    if (textObj.length - 1 > 1) {
      response = "END More inputs provided. Kindly start afresh!";
      return utils.send_response(res, response);
    }
    if (textObj.length - 1 == 1) {
      let projectCode = textObj[0];
      let receipt_no = textObj[1];
      /**
       * do validation, if it fails log and return response to user,else proceed and start processing
       */
      const validation = validate(
        {
          receipt_no,
          projectCode,
        },
        constraints
      );

      if (validation) {
        /**
         * validation fails
         */
        if (!_.isEmpty(req.body)) {
          logger.filecheck(
            `ERROR(E01): Revenue reward scheme validation failed for receipt_no: ${receipt_no}, request_phone: ${phoneNumber},sessionId: ${sessionId}, at ${time} with error ${
              Object.values(validation)[0]
            } \n`
          );
          response = "END " + Object.values(validation)[0];
          return utils.send_response(res, response);
        }
      } else {
        /**
         * validation is successful
         */

        /**
         * at this early stage, if receipt already exists, log error, end session and return response to user
         */
        console.log("*** validation passed ***");

        let MONGO_URI,
          REVOTAX_API_URL,
          REVOTAX_API_KEY,
          RABBIT_URL,
          RABBIT_EXCHANGE_NAME,
          RABBIT_QUEUE_NAME,
          RABBIT_RKEY_NAME;
        if (projectCode == "301") { // abia
          MONGO_URI =
            "mongodb://root:live1App@157.245.245.6:27027/rrs_abia?authSource=admin";
          REVOTAX_API_URL = "https://abia.tax/app/apiPayment/get_receipt";
          REVOTAX_API_KEY = "393j23k9d022332jjkjdo";
          RABBIT_URL = "amqp://guest:guest@157.245.245.6:5672";
          RABBIT_EXCHANGE_NAME = "ABIA_RRS_USSD_EXCHANGE";
          RABBIT_QUEUE_NAME = "ABIA_RRS_USSD_REVOTAX_QUEUE";
          RABBIT_RKEY_NAME = "ABIA_RRS_USSD_RKEY";
        }else if (projectCode == "312") { // imo
          MONGO_URI =
            "mongodb://root:live1App@157.245.245.6:27027/rrs_imo?authSource=admin";
          REVOTAX_API_URL = "https://imostate.tax/app/apiPayment/get_receipt";
          REVOTAX_API_KEY = "393j23k9d022332jjkjdo";
          RABBIT_URL = "amqp://guest:guest@157.245.245.6:5672";
          RABBIT_EXCHANGE_NAME = "IMO_RRS_USSD_EXCHANGE";
          RABBIT_QUEUE_NAME = "IMO_RRS_USSD_REVOTAX_QUEUE";
          RABBIT_RKEY_NAME = "IMO_RRS_USSD_RKEY";
        }else if (projectCode == "331") { // anambra
          MONGO_URI =
            "mongodb://root:live1App@157.245.245.6:27027/rrs_anambra?authSource=admin";
          REVOTAX_API_URL = "https://anambra.tax/app/apiPayment/get_receipt";
          REVOTAX_API_KEY = "393j23k9d022332jjkjdo";
          RABBIT_URL = "amqp://guest:guest@157.245.245.6:5672";
          RABBIT_EXCHANGE_NAME = "ANAMBRA_RRS_USSD_EXCHANGE";
          RABBIT_QUEUE_NAME = "ANAMBRA_RRS_USSD_REVOTAX_QUEUE";
          RABBIT_RKEY_NAME = "ANAMBRA_RRS_USSD_RKEY";
        }else if (projectCode == "341") { // crs
          MONGO_URI =
            "mongodb://root:live1App@157.245.245.6:27027/rrs_anambra?authSource=admin";
          REVOTAX_API_URL = "https://crs.tax/app/apiPayment/get_receipt";
          REVOTAX_API_KEY = "393j23k9d022332jjkjdo";
          RABBIT_URL = "amqp://guest:guest@157.245.245.6:5672";
          RABBIT_EXCHANGE_NAME = "ANAMBRA_RRS_USSD_EXCHANGE";
          RABBIT_QUEUE_NAME = "ANAMBRA_RRS_USSD_REVOTAX_QUEUE";
          RABBIT_RKEY_NAME = "ANAMBRA_RRS_USSD_RKEY";
        }else{
          response = "END Error(E02): Invalid project code " + projectCode + "!";
          logger.filecheck(`${response} \n`);
          console.log(`*** ${response} ***`);
          return utils.send_response(res, response);
        }
        const mongooseNow = require("mongoose");
        var connNow = mongooseNow.createConnection(MONGO_URI, {
          useNewUrlParser: true,
          useCreateIndex: true,
          useFindAndModify: false,
          useUnifiedTopology: true,
        });
        console.log(`mongooseNow connected: ${connNow}`);

        var Schema = new mongooseNow.Schema({});
        var Receipt = connNow.model("Receipt", Schema);
        const check_receipt = await Receipt.find({ receiptNumber: receipt_no });

        /**
         * if receipt exists,log and return error to user that this receipt is already registered for rrs
         */
        if (!_.isEmpty(check_receipt)) {
          response = "END Error(E02): receipt is already registered for rrs!";
          logger.filecheck(`${response} \n`);
          console.log(`*** ${response} ***`);
          return utils.send_response(res, response);
        }
        console.log(
          `*** receipt is not yet used, begin create Event and terminate the USSD session! ***`
        );

        try {
          /**
           * check if receipt is valid in revotax
           */
          let url = REVOTAX_API_URL;
          let apikey = REVOTAX_API_KEY;
          let raw = { receipt_no: receipt_no, api_key: apikey };
          const result = await axios.post(url, raw, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Connection: "Keep-Alive",
              apiKey: apikey,
              "User-Agent": "Apache-HttpClient/4.1.1",
            },
          });
          console.log(result.data);
          /**
           * terminate session if receipt is not eligible
           */
          if (result.data.code != "00") {
            response = `END ERROR(E03): Receipt not found or not eligible for RRS!`;
            logger.filecheck(`${response} \n`);
            console.log(`*** ${response} ***`);
            return utils.send_response(res, response);
          }

          /**
           * create an event entry, terminate the session and process receipt detail from event listener
           */
          let event_data = {
            exchange: RABBIT_EXCHANGE_NAME,
            queue: RABBIT_QUEUE_NAME,
            rkey: RABBIT_RKEY_NAME,
            msg: JSON.stringify({
              projectCode,
              receipt_no,
              phoneNumber,
              sessionId,
              networkCode,
              serviceCode,
            }),
          };
          const setJob = await utils.jobQueue(event_data);
          console.log(
            `*** begin event sourcing, post the event_data: ${JSON.stringify(
              event_data
            )} to event server ***`
          );
          console.log(
            `*** response from event server: ${JSON.stringify(
              setJob
            )} returns ***`
          );
          logger.filecheck(
            `INFO: RRS event data: ${JSON.stringify(
              event_data
            )}, event response: ${JSON.stringify(
              setJob
            )} successfully sourced: at ${time}  \n`
          );
          console.log(
            `*** notify that rrscode will be sent to user and end session ***`
          );
          return utils.send_response(
            res,
            `END You will receive your RRS Code via email and sms shortly. \n Thanks`
          );
        } catch (error) {
          /**
           * if call to the service fails, display a message and log the actual error for the developer alone to see
           */
          logger.filecheck(
            `ERROR(E04): RRS call to revotax receipt service failed with error: ${error} \n`
          );
          response = "END Error(E04): request failed!";
          console.log(`*** ${response} ***`);
          return utils.send_response(res, response);
        }
      }
    }
  } catch (error) {
    response = "END Error(E06): an error occured, request not completed!";
    logger.filecheck(
      `ERROR(E06): RRS call to revotax receipt service failed with error: ${error} \n`
    );
    console.log(`*** ${response} ***`);
    return utils.send_response(res, response);
  }
});

exports.doRRSJob = asyncHandler(async (obj) => {
  try {
    /**
     * initialize key variables
     */
    let currMonthYear = await utils.getDateElemsText(Date.now());
    currMonthYear = currMonthYear.month + ", " + currMonthYear.year;
    const currDayMonthYear = await utils.currDayMonthYear();
    console.log(`\n\n*** getting variables ***`);
    console.log(`*** currMonthYear: ${currMonthYear} ***`);

    /**
     * build contraints for validate.js
     */
    const constraints = {
      receipt_no: {
        presence: {
          allowEmpty: false,
          message: "Receipt_no is required",
        },
        length: {
          minimum: 8,
          maximum: 20,
          message: "must be between 8 and 20 characters",
        },
      },
    };
    /**
     * destructure the request body and pick the needed params
     */
    let { receipt_no, phoneNumber, sessionId, networkCode, serviceCode } = obj;
    console.log("*** event body: ***");
    console.log(obj);
    let response = "";

    /**
     * do validation, if it fails log and return response to user,else proceed and start processing
     */
    const validation = validate(
      {
        receipt_no,
      },
      constraints
    );

    if (validation) {
      /**
       * validation fails
       */
      response = `END Error(E07): Revenue reward scheme validation failed for receipt_no: ${receipt_no}!`;
      logger.filecheck(
        `ERROR(E07): Revenue reward scheme validation failed for receipt_no: ${receipt_no}, request_phone: ${phoneNumber},sessionId: ${sessionId}, at ${time} with error ${
          Object.values(validation)[0]
        } \n`
      );
      return response;
    } else {
      /**
       * validation is successful
       */
      console.log("*** validation passed ***");
      const check_receipt = await helper.ReceiptHelper.getReceipt({
        receiptNumber: receipt_no,
      });
      if (check_receipt) {
        /**
         * if receipt exists,log and return error to user that this receipt is already registered for rrs
         */
        response = "Error(E08): receipt is already registered for rrs!";
        logger.filecheck(`${response} \n`);
        console.log(`*** ${response} ***`);
        return response;
      }
      let url = process.env.REVOTAX_API_URL;
      let apikey = process.env.REVOTAX_API_KEY;
      let raw = { receipt_no: receipt_no, api_key: apikey };
      try {
        const result = await axios.post(url, raw, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Connection: "Keep-Alive",
            apiKey: apikey,
            "User-Agent": "Apache-HttpClient/4.1.1",
          },
        });
        let r_data = result.data;
        /**
         * if receipt_no is valid
         */
        if (r_data.code == "00") {
          /**
           * destructure promise data from revotax service call
           */
          let {
            taxId,
            email,
            phone,
            receiptAmount,
            receiptDate,
            receiptNumber,
            receiptItemName,
            receiptItemCode,
            userType,
            lastName,
            firstName,
            middleName,
            companyName,
            project,
            homeLga,
            homeState,
            homeTown,
            homeAddress,
            gender,
            paymentMethod,
            depositorSlipNumber,
            depositorName,
            agentType,
            occupation,
            photoUrl,
            dateOfBirth,
            bvn,
          } = r_data.data;
          /**
           * if receiptDate from search is older than current month/year, tell user the receipt is expired for the monthly rrs
           */
          let curr_date = await utils.toMysqlFormat(Date());
          const same = await utils.sameMonthYear(curr_date, receiptDate);
          if (!same) {
            response = `ERROR(E09): Receipt date ${receiptDate} from Revotax service error: receipt is not for this curr_date ${curr_date}!`;
            logger.filecheck(`*** ${response} *** \n`);
            return response;
          }
          /**
           * create a user first if user do not exist and get the user doc ID
           */
          let pw = generator.generate({
            length: 10,
            numbers: true,
            uppercase: true,
            lowercase: true,
            symbols: false,
          });
          let pw_hashed = await utils.hashPassword(pw);
          console.log(`Generated password for user: ${pw}`);
          user_data = {
            taxId,
            lastName,
            firstName,
            middleName,
            companyName,
            email,
            phone,
            userType,
            project,
            homeLga,
            homeState,
            homeTown,
            homeAddress,
            gender,
            agentType,
            occupation,
            photoUrl,
            dateOfBirth,
            bvn,
            firstLogin: 1,
            password: pw_hashed,
            userData: r_data.data,
          };
          console.log(`*** checking user... ***`);
          const check_user = await helper.UserHelper.getUser({
            $or: [{ email }, { phone }, { taxId }],
          });
          let user_doc_id;
          let user_exists = 0;
          if (check_user) {
            console.log(`*** user exists! ***`);
            user_exists = 1;
            user_doc_id = check_user._id;
            /**
             * if any major incoming param changes, update
             */
            if (
              photoUrl != check_user.photoUrl ||
              lastName != check_user.lastName ||
              firstName != check_user.firstName ||
              homeState != check_user.homeState ||
              homeTown != check_user.homeTown ||
              homeLga != check_user.homeLga ||
              homeAddress != check_user.homeAddress ||
              email != check_user.email ||
              phone != check_user.phone
            ) {
              console.log(`*** begin update of user data if changed ***`);
              await helper.UserHelper.updateUser({
                filter: {
                  taxId,
                },
                update: {
                  $set: {
                    lastName,
                    firstName,
                    middleName,
                    companyName,
                    email,
                    phone,
                    homeLga,
                    homeState,
                    homeTown,
                    homeAddress,
                    userType,
                    project,
                    userData: r_data.data,
                  },
                },
                options: {},
              });
              console.log(`*** user data updated ***`);
            }
          } else {
            console.log(`*** user do not exist, begin create user ***`);
            const create_user = await helper.UserHelper.createUser(user_data);
            user_doc_id = create_user._id;
          }
          /**
           * user doc id must be created or found
           */
          if (user_doc_id) {
            /**
             * generate rrs code and create rrs if rrs do not exist for this user at the current month and year
             * else, get the existing rrs code for current month and year
             */

            /**
             * Very important!
             * if however, old receipt need to be posted and RRS code need to be generated for an old month
             * then we need to abstract currDayMonthYear.month/year values to come from a variable which will extract the month/year from receiptDate coming from revotax service
             * As it is now, even if the code that restricts old receipt is removed above and old receipt comes in,it will appear under current month/year RSS code generated.
             */
            console.log(`*** user object obtained: begin check rrscode ***`);
            console.log(
              `*** month: ${currDayMonthYear.month}, year: ${currDayMonthYear.year}  ***`
            );
            const check_rrs =
              await helper.RrsCodeHelper.getRrsUserForCurrMonthYear({
                $and: [
                  { userId: user_doc_id },
                  { rrsCodeMonth: currDayMonthYear.month },
                  { rrsCodeYear: currDayMonthYear.year },
                ],
              });
            console.log(` *** check_rrs: ${check_rrs} ***`);
            let rrs_code_doc_id;
            if (check_rrs) {
              console.log(`*** rrs code exists ***`);
              rrs_code_doc_id = check_rrs._id;
            } else {
              console.log(`*** rrs code do not exist, begin generate rrs ***`);
              const rrs_code = await helper.RrsCodeHelper.generateRRS();
              rrs_data = {
                userId: user_doc_id,
                rrsCode: rrs_code,
                rrsCodeMonth: currDayMonthYear.month,
                rrsCodeYear: currDayMonthYear.year,
                rrsCodeData: {
                  taxId,
                  receiptItemName,
                  receiptItemCode,
                  receiptAmount,
                  receiptDate,
                  receiptNumber,
                  paymentMethod,
                  depositorSlipNumber,
                  depositorName,
                },
              };
              console.log(
                `*** rrs code: ${rrs_code} generated, linking user to rrs code ***`
              );
              const create_rrs = await helper.RrsCodeHelper.createUserRrsCode({
                user_id: user_doc_id,
                data: rrs_data,
              });
              rrs_code_doc_id = create_rrs._id;
              console.log(`*** user linked to rrs code ***`);
            }
            /**
             * rrs_code_doc_id must be created or found
             */
            if (rrs_code_doc_id) {
              /**
               * begin insert receipt
               * create receipt record only if receipt do not exist already, if it exist return to user that this receipt is already registered for rrs
               */
              console.log(`*** receipt do not exist so insert receipt ***`);
              let receipt_doc_id;
              let receipt_data = {
                rrsCodeId: rrs_code_doc_id,
                receiptItemName,
                receiptItemCode,
                receiptNumber,
                receiptAmount,
                receiptDate,
                paymentMethod,
                depositorSlipNumber,
                depositorName,
                receiptData: {
                  taxId,
                  requestPhone: phoneNumber,
                  networkCode,
                  serviceCode,
                  sessionId,
                  time: time,
                },
              };
              const create_receipt =
                await helper.ReceiptHelper.createRrsCodeReceipt({
                  rrs_code_id: rrs_code_doc_id,
                  data: receipt_data,
                });
              receipt_doc_id = create_receipt._id;
              /**
               * begin insert ussd log
               * create ussd log record only if receipt is created, it must be inside the * if(!check_receipt){ * statement
               */
              if (receipt_doc_id) {
                console.log(`*** receipt created ***`);
                ussd_log_data = {
                  receiptId: receipt_doc_id,
                  sessionId,
                  requestPhone: phoneNumber,
                  requestData: {},
                  responseData: r_data.data,
                };
                console.log(`*** begin add ussdlog ***`);
                const create_ussd_log =
                  await helper.UssdLogHelper.createUssdLog(ussd_log_data);

                /**
                 * begin sms sending
                 */
                console.log(`*** begin sms sending ***`);
                let success = 0;
                let rrs_code = await helper.RrsCodeHelper.getRrsCode({
                  _id: rrs_code_doc_id,
                });
                let to = phone;
                let message = `RRS account created, Url: ${process.env.APP_URL}, Login: ${email}, Password: ${pw}, RRS_CODE: ${rrs_code.rrsCode}`;
                if (user_exists) {
                  message = `Your RRS_CODE is: ${rrs_code.rrsCode}`;
                }
                if (_.isEmpty(to)) {
                  to = phoneNumber;
                }
                console.log(`*** sms data: ${message} ***`);
                const send_sms = await utils.send_sms_api({
                  to,
                  message,
                  encoded: false
                });
                if (
                  send_sms.response.StatusCode == "101" ||
                  send_sms.response.StatusCode == "102" ||
                  send_sms.response.StatusCode == "100" ||
                  send_sms.response.Status == "Success"
                ) {
                  success = 1;
                }

                sms_log_data = {
                  phone: phone,
                  requestData: send_sms.request,
                  responseData: send_sms.response,
                  smsLogStatus: success,
                };
                const create_sms_log = await helper.SmsLogHelper.createSmsLog(
                  sms_log_data
                );
                console.log(`*** smslog added, begin email sending ***`);
                /**
                 * begin email sending
                 */
                let success2 = 0;
                let p;
                let emailPhone = email + " or " + phone;
                if (user_exists) {
                  /**
                   * send user exist template
                   */
                  let emailParams = {
                    heading: "Welcome back, RRS Code for " + currMonthYear,
                    previewText:
                      "RRS is a revenue reward scheme designed to appreciate tax-payers and make revenue collection a bit fun!",
                    message:
                      "Revenue reward scheme (RRS) is a program designed to reward tax payers. At every month-end, a draw is made where the lucky tax-payers are provided with a reward.",
                    rrsCode: rrs_code.rrsCode,
                    receiptNumber,
                    email
                  };
                  p = {
                    to: email,
                    message: emailTemplate.existingUser(emailParams),
                    subject: "Revenue Reward Scheme Code for " + currMonthYear,
                  };
                } else {
                  let emailParams = {
                    heading:
                      "Your RRS account created & monthly RRS Code for " +
                      currMonthYear +
                      " successfully generated",
                    previewText:
                      "RRS is a revenue reward scheme designed to appreciate tax-payers and make revenue collection a bit fun!",
                    emailPhone,
                    email,
                    password: pw,
                    message:
                      "Revenue reward scheme (RRS) is a program designed to reward tax payers. At every month-end, a draw is made where the lucky tax-payers are provided with a reward.",
                    rrsCode: rrs_code.rrsCode,
                    receiptNumber,
                  };
                  p = {
                    to: email,
                    message: emailTemplate.newUser(emailParams),
                    subject: "Revenue Reward Scheme Code for " + currMonthYear,
                  };
                }
                const send_email = await utils.send_email_api(p);
                if (send_email.response.Code == "02") {
                  success2 = 1;
                }
                console.log(`*** email sent ***`);
                email_log_data = {
                  email: email,
                  requestData: send_email.request,
                  responseData: send_email.response,
                  emailLogStatus: success2,
                };
                const create_email_log =
                  await helper.EmailLogHelper.createEmailLog(email_log_data);
                console.log(`*** emaillog added ***`);
                /**
                 * return RRS code to user
                 */
                logger.filecheck(
                  `INFO: RRS ${rrs_code.rrsCode} successfully generated: at ${time}  \n`
                );
                console.log(`*** return 1 to event consumer ***`);
                return 1;
              }
            } else {
              /**
               * log and return error if rrs_code_doc_id not created or found
               */
              response =
                "END Error(E10): RRS rrs_code create failed with error: rrs_code document ID not created!";
              logger.filecheck(`*** ${response} *** \n`);
              console.log(`*** ${response} ***`);
              return response;
            }
          } else {
            /**
             * log and return error if user doc id not created or found
             */
            response =
              "END Error(E11): an error occured, RRS user create failed with error: user document ID not created!";
            logger.filecheck(`*** ${response} *** \n`);
            console.log(`*** ${response} ***`);
            return response;
          }
        } else {
          /**
           * if receipt_no is not valid
           */
          response = `Error(E12): invalid RRS receipt with error: ${r_data.message}!`;
          logger.filecheck(`${response}\n`);
          console.log(`*** ${response} ***`);
          return response;
        }
      } catch (error) {
        /**
         * if call to the service fails, display a message and log the actual error for the developer alone to see
         */
        response = `ERROR(E13): RRS call to revotax receipt service failed with error: ${error}`;
        logger.filecheck(`*** ${response} *** \n`);
        console.log(`*** ${response} ***`);
        return response;
      }
    }
  } catch (error) {
    response = "Error(E14): an error occured, request not completed!";
    logger.filecheck(`*** ${response} *** \n`);
    console.log(`*** ${response} ***`);
    return response;
  }
});
