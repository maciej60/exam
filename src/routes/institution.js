const router = require('express').Router();
const {
    setup,
    add,
    update,
    list,
    remove,
    addDocType,
    updateDocType,
    listDocType,
    removeDocType,
    getInstitution,
    getDocType
} = require("../controllers/institution");

const { protect } = require("../middleware/auth");
const { uploadInstitutionLogo } = require("../middleware/fileUploader");

router.post('/setup', setup);
router.post('/add', add);
router.post("/update", protect, uploadInstitutionLogo.single("institutionLogo"), update);
router.post("/list", protect, list);
router.post("/delete", protect, remove);
router.post("/addDocType", protect, addDocType);
router.post("/updateDocType", protect, updateDocType);
router.post("/listDocType", protect, listDocType);
router.post("/removeDocType", protect, removeDocType);

router.post("/single", protect, getInstitution);
router.post("/docType/single", protect, getDocType);

module.exports = router;
