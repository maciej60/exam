const path = require("path");
const multer = require("multer");
let appRoot = require("app-root-path");
const helper = require("../utils/model_helpers");
const utils = require("../utils");
const fs = require('fs');
const _ = require("lodash");
const ObjectId = require("mongoose").Types.ObjectId;
let msg, institutionCode, candidateCode, dir, dynamicFileName;
let fl = [];

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
  if(action === "uploadCandidateDocuments"){
    if(req.body.candidateId){
      let candidate = await helper.CandidateHelper.getCandidate({ _id: new ObjectId(req.body.candidateId) });
      if(candidate){
        candidateCode = candidate.candidateCode
        institutionCode = candidate.institutionId.institutionCode
        dir = `${appRoot}/public/uploads/institutions/${institutionCode}/candidates/${candidateCode}/documents`
        if(req.body.applicationId){
          let ft = await helper.ApplicationHelper.getApplicationDocumentType({
            candidateId: new ObjectId(req.body.candidateId), applicationId: new ObjectId(req.body.applicationId)
          });
          if(ft[0].institutionDocumentTypes){
            if(_.isEmpty(fl)){
              _.forEach(ft[0].institutionDocumentTypes,  (u) => {
                fl.push({name: u.abbr, type: u.type })
              })
            }
            return true;
          }else{
            return false;
          }
        }else{
          return false;
        }
      }else{
        return false;
      }
    }else{
      return false;
    }
  }
  if (action === "institutionLogo") {
    if (req.body.id) {
      let institution = await helper.InstitutionHelper.getInstitution({
        _id: new ObjectId(req.body.id),
      });
      if (institution) {
        institution = institution[0];
        institutionCode = institution.institutionCode;
        dir = `${appRoot}/public/uploads/institutions/${institutionCode}/logo`;
        return true;
      } else {
        return false;
      }
    } else {
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

  uploadCandidateDocuments: multer({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        let paramsInitialized = await access(req, "uploadCandidateDocuments")
        if(!paramsInitialized) {
          msg = `Params to initialize store not present!`
          cb(null, false);
        }
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: async (req, file, cb) => {
        //const ext = path.extname(file.originalname).toLocaleLowerCase();
        if(!_.isEmpty(dynamicFileName)){
          const n = `${dynamicFileName.toLocaleLowerCase()}`
          if (fs.existsSync(`${dir}/n`)){
            fs.unlinkSync(n);
          }
          cb(null, n);
        }
      },
    }),
    fileFilter: async function (req, file, cb) {
      dynamicFileName = ""
      await access(req, "uploadCandidateDocuments")
      const fieldName = file.fieldname.toLocaleLowerCase()
      const extName = path.extname(file.originalname).toLocaleLowerCase()
      const name = file.originalname.toLocaleLowerCase()
      const finder = (arr, n) => {
        for (const obj of arr) {
          if (obj.name === n) return obj;
        }
      }
      let found = await finder(fl, fieldName)
      if(found){
        dynamicFileName = found.name + extName
        let t = found.type
        if(t.indexOf("image") > -1){
          if(
              file.mimetype === "image/png" ||
              file.mimetype === "image/jpg" ||
              file.mimetype === "image/jpeg" ||
              file.mimetype === "image/svg" ||
              file.mimetype === "image/gif"
          ){
            const types = /png|jpg|jpeg|gif|svg/
            const mimetype = types.test(file.mimetype)
            const extName = types.test(path.extname(file.originalname).toLocaleLowerCase())
            if(extName && mimetype){
              cb(null, true);
              return;
            }else{
              msg = "Only supported png,jpeg,jpg,gif and svg format image"
            }
          }else{
            msg = `Upload an image file`
          }
        }
        if(t.indexOf("pdf") > -1){
          if(file.mimetype === "application/pdf"){
            const types = /pdf/
            const mimetype = types.test(file.mimetype)
            const extName = types.test(path.extname(file.originalname).toLocaleLowerCase())
            if(extName){
              cb(null, true);
              return;
            }else{
              msg = "Only supported .pdf format"
            }
          }else{
            msg = `Upload a pdf file`
          }
        }
        if(t.indexOf("word") > -1){
          if(
              file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
              file.mimetype === "application/msword"
          ){
            const types = /docx|doc/
            const mimetype = types.test(file.mimetype)
            const extName = types.test(path.extname(file.originalname).toLocaleLowerCase())
            if(extName){
              cb(null, true);
              return;
            }else{
              msg = "Only supported .doc, doc format"
            }
          }else{
            msg = `Upload a word file`
          }
        }
        if(t.indexOf("spreadsheet") > -1){
          if(
              file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
              file.mimetype === "text/csv" ||
              file.mimetype === "application/vnd.ms-excel"
          ){
            const types = /xlsx|xls|csv/
            const mimetype = types.test(file.mimetype)
            const extName = types.test(path.extname(file.originalname).toLocaleLowerCase())
            if(extName){
              cb(null, true);
              return;
            }else{
              msg = "Only supported .xlsx, xls, csv format"
            }
          }else{
            msg = `Upload an excel or csv file`
          }
        }
        cb(null, false);
      }else{
        msg = `File not allowed for this application`
        cb(null, false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  }),

  uploadInstitutionLogo: multer({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        let paramsInitialized = await access(req, "institutionLogo");
        if (!paramsInitialized) {
          msg = `Params to initialize store not present!`;
          cb(null, false);
          return msg;
        }
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: async (req, file, cb) => {
        const ext = path.extname(file.originalname).toLocaleLowerCase();
        cb(null, `${institutionCode.toLocaleLowerCase()}${ext}`);
      },
    }),
    fileFilter: async function (req, file, cb) {
      const types = /png|jpg|jpeg|webp|gif|svg/;
      const extName = types.test(
          path.extname(file.originalname).toLocaleLowerCase()
      );
      const mimetype = types.test(file.mimetype);
      if (extName) {
        if (mimetype) {
          if (file.fieldname === "institutionLogo") {
            if (!req.body.id) {
              msg = `Logo not provided, please re-arrange the body params to come before file`;
              cb(null, false);
              return msg;
            }
            cb(null, true);
          } else {
            msg = `File field name is not correct`;
            cb(null, false);
            return msg;
          }
        } else {
          msg = `Upload an image file`;
          cb(null, false);
          return msg;
        }
      } else {
        msg = "Only supported png,jpeg,jpg,gif and svg format image";
        cb(null, false);
        return msg;
      }
    },
    limits: {
      fileSize: 1024 * 1024,
    },
  }),

};


