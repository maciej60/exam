const path = require("path");
const multer = require("multer");
let appRoot = require("app-root-path");
const helper = require("../utils/model_helpers");
const utils = require("../utils");
const fs = require('fs');
const ObjectId = require("mongoose").Types.ObjectId;
let msg, institutionCode, candidateCode, dir;

async function access(req, action){
  if(action === "uploadCandidateCsv"){
    if(req.body.institutionId){
      let institution = await helper.InstitutionHelper.getInstitution({ _id: new ObjectId(req.body.institutionId) });
      if(institution){
        institution = institution[0]
        institutionCode = institution.institutionCode
        dir = `${appRoot}/public/uploads/institutions/${institutionCode}/candidates`
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }
  if(action === "uploadCandidatePhoto"){
    if(req.body.id){
      let candidate = await helper.CandidateHelper.getCandidate({ _id: new ObjectId(req.body.id) });
      if(candidate){
        candidateCode = candidate.candidateCode
        institutionCode = candidate.institutionId.institutionCode
        dir = `${appRoot}/public/uploads/institutions/${institutionCode}/candidates/${candidateCode}/photo`
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }
  return false;
}

module.exports = {

  uploadCandidateCsv: multer({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        let paramsInitialized = await access(req, "uploadCandidateCsv")
        if(!paramsInitialized) {
          msg = `Params to initialize store not present!`
          cb(null, false);
          return msg;
        }
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: async (req, file, cb) => {
        const ext = path.extname(file.originalname).toLocaleLowerCase();
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
      },
    }),
    fileFilter: async function (req, file, cb) {
      if (
          file.mimetype.split("/")[1] === "csv" ||
          file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.mimetype === "application/vnd.ms-excel"
      ) {
        if (file.fieldname === "csvFile") {
          if(!req.body.institutionId){
            msg = `Institution not provide, please re-arrange the body params to come before file`
            cb(null, false);
            return msg;
          }
          cb(null, true);
        } else {
          msg = `File field is not correct`
          cb(null, false);
          return msg;
        }
      } else {
        msg = `Upload csv or an excel file`
        cb(null, false);
        return msg;
      }
    },
    limits: {
      fileSize: 1024 * 1024,
    },
  }),

  uploadCandidatePhoto: multer({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        let paramsInitialized = await access(req, "uploadCandidatePhoto")
        if(!paramsInitialized) {
          msg = `Params to initialize store not present!`
          cb(null, false);
          return msg;
        }
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: async (req, file, cb) => {
        const ext = path.extname(file.originalname).toLocaleLowerCase();
        cb(null, `${candidateCode.toLocaleLowerCase()}${ext}`);
      },
    }),
    fileFilter: async function (req, file, cb) {
      const types = /png|jpg|jpeg|webp|gif|svg/
      const extName = types.test(path.extname(file.originalname).toLocaleLowerCase())
      const mimetype = types.test(file.mimetype)
      if(extName){
        if(mimetype){
          if (file.fieldname === "photoUrl") {
            if(!req.body.id){
              msg = `Candidate not provided, please re-arrange the body params to come before file`
              cb(null, false);
              return msg;
            }
            cb(null, true);
          } else {
            msg = `File field name is not correct`
            cb(null, false);
            return msg;
          }
        } else {
          msg = `Upload an image file`
          cb(null, false);
          return msg;
        }
      }else{
        msg = "Only supported png,jpeg,jpg,gif and svg format image"
        cb(null, false);
        return msg;
      }
    },
    limits: {
      fileSize: 1024 * 1024,
    },
  }),

};


