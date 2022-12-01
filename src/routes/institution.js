const router = require('express').Router();
const {
    add,
    update,
    list,
    remove,
    addDocType,
    updateDocType,
    listDocType,
    removeDocType
} = require("../controllers/institution");

const { protect } = require("../middleware/auth");

router.post('/add', add);
router.post("/update", protect, update);
router.post("/list", protect, list);
router.post("/delete", protect, remove);
router.post("/addDocType", protect, addDocType);
router.post("/updateDocType", protect, updateDocType);
router.post("/listDocType", protect, listDocType);
router.post("/removeDocType", protect, removeDocType);

module.exports = router;
