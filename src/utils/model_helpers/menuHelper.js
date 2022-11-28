
const fs = require("fs");
const _ = require("lodash");
const generator = require("generate-password");
const moment = require("moment");
const strings = require("locutus/php/strings");
const UserMenu = require("../../models/UserMenu");
const InstitutionMenu = require("../../models/InstitutionMenu");
const MenuHeader = require("../../models/MenuHeader");
const Module = require("../../models/Module");
const Menu = require("../../models/Menu");
const DeletedData = require("../../models/DeletedData");
const utils = require("..");
const number_format = require("locutus/php/strings/number_format");
const time = new Date(Date.now()).toLocaleString();

module.exports = {

  createMenu: async (data) => {
    return Menu.create(data);
  },

  createInstitutionMenu: async (data) => {
    return InstitutionMenu.create(data);
  },

  getMenu: async (data) => {
    return Menu.find(data).populate({path: 'menuHeaderId'}).populate({path: 'moduleId'});
  },

  getInstitutionMenu: async (data) => {
    return InstitutionMenu.findOne(data).populate({path: 'institutionId'});
  },

  /*createUserMenu: async (data) => {
    const del = await UserMenu.deleteMany({ userId: data.userId, institutionId: data.institutionId });
    return data.userMenuData ? UserMenu.insertMany(data.userMenuData) : false;
  },*/

  createUserMenu: async (data) => {
    return UserMenu.create(data);
  },

  getUserMenu: async (data) => {
    return UserMenu.findOne(data).select('menuData userId institutionId -_id').populate({path: 'institutionId'}).populate({path: 'userId'});
  },

  
};