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
    removePermission
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

module.exports = router;
