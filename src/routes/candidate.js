const router = require("express").Router();
const {
  add,
  list,
  update,
  remove,
  importCandidate,
  uploadDocument,
  listDocument,
  removeDocument,
  getCandidate
} = require("../controllers/candidate");

const { uploadCandidateCsv, uploadCandidatePhoto, uploadCandidateDocuments } = require("../middleware/fileUploader");
const { protect } = require("../middleware/auth");

router.post("/add", protect, add);
router.post("/list", protect, list);
router.post("/update", protect, uploadCandidatePhoto.single("photoUrl"), update);
router.post("/delete", protect, remove);
router.post("/single", protect, getCandidate);
router.post("/import", protect, uploadCandidateCsv.single("csvFile"), importCandidate);
router.post("/uploadDocument", protect, uploadCandidateDocuments.any(), uploadDocument);
router.post("/listDocument", protect, listDocument);
router.post("/removeDocument", protect, removeDocument);

module.exports = router;
