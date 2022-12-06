
const _ = require("lodash");
const DeletedData = require("../../models/DeletedData");

module.exports = {
  backupAndDelete: async (data) => {
    let { ids, deletedBy, model } = data;
    let modelLoader = require("../../models/" + data.model);
    _.forEach(ids, async (u) => {
      if (u) {
        let deleteData = {
          deletedData: await modelLoader.findById(u),
          deletedModel: model,
          deletedBy,
        };
        await DeletedData.create(deleteData);
      }
    });
    const v = await modelLoader.deleteMany({ _id: { $in: ids } });
    console.log(v);
    return v;
  },
  UserHelper: require("./userHelper"),
  ApplicationHelper: require("./applicationHelper"),
  InstitutionHelper: require("./institutionHelper"),
  SubjectHelper: require("./subjectHelper"),
  QuestionHelper: require("./questionHelper"),
  MenuHelper: require("./menuHelper"),
  CandidateHelper: require("./candidateHelper"),
  SmsLogHelper: require("./smsLogHelper"),
  EmailLogHelper: require("./emailLogHelper"),
  DropDownHelper: require("./dropdownHelper"),
  TokenHelper: require("./tokenHelper"),
};

