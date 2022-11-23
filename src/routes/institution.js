const router = require('express').Router();
const {
    add,
    update,
    list,
    remove
} = require("../controllers/institution");

const { protect } = require("../middleware/auth");

router.post('/add', protect, add);
router.post("/update", protect, update);
router.post("/list", protect, list);
router.post("/delete", protect, remove);

module.exports = router;
