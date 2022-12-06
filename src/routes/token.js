const router = require("express").Router();
const {
  add,
  getToken,
  update,
  remove,
} = require("../controllers/token");

const { protect } = require("../middleware/auth");

router.post("/add", add);
router.post("/single", getToken);
router.post("/update", update);
router.post("/delete", protect, remove);

module.exports = router;
