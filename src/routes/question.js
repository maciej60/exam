const router = require("express").Router();
const {
    add,
    list,
    update,
    remove,
} = require("../controllers/question");

const { protect } = require("../middleware/auth");

router.post("/add", protect, add);
router.post("/list", protect, list);
router.post("/update", protect, update);
router.post("/remove", protect, remove);

module.exports = router;