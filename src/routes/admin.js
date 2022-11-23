const router = require("express").Router();
const {
  addAdmin,
  updateAdmin
} = require("../controllers/user");
const { protect } = require("../middleware/auth");

router.post("/add", protect, addAdmin);
router.post("/update", protect, updateAdmin);

module.exports = router;
