const router = require("express").Router();
const {
  add,
  list,
  update,
  remove,
  importCandidate,
} = require("../controllers/candidate");

const {uploadCandidateCsv, uploadCandidatePhoto} = require("../middleware/fileUploader");
const { protect } = require("../middleware/auth");

router.post("/add", protect, add);
router.post("/list", protect, list);
router.post("/update", protect, uploadCandidatePhoto.single("photoUrl"), update);
router.post("/delete", protect, remove);
router.post("/import", protect, uploadCandidateCsv.single("csvFile"), importCandidate);

module.exports = router;
