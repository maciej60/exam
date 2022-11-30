const router = require('express').Router();
const {
    add,
    update,
    list,
    remove,
    addStage,
    updateStage,
    listStage,
    removeStage,
    addPermission,
    updatePermission,
    listPermission,
    removePermission,
    addDocType,
    updateDocType,
    listDocType,
    removeDocType
} = require("../controllers/application");

const { protect } = require("../middleware/auth");

router.post('/add', protect, add);
router.post("/update", protect, update);
router.post("/list", protect, list);
router.post("/delete", protect, remove);
router.post('/addStage', protect, addStage);
router.post('/updateStage', protect, updateStage);
router.post("/listStage", protect, listStage);
router.post("/removeStage", protect, removeStage);
router.post("/addPermission", protect, addPermission);
router.post("/updatePermission", protect, updatePermission);
router.post("/listPermission", protect, listPermission);
router.post("/removePermission", protect, removePermission);
router.post("/addDocType", protect, addDocType);
router.post("/updateDocType", protect, updateDocType);
router.post("/listDocType", protect, listDocType);
router.post("/removeDocType", protect, removeDocType);

module.exports = router;
