const router = require("express").Router();
const {
  listUsers,
  addUser,
  updateUser
} = require("../controllers/user");
const { protect } = require("../middleware/auth");

router.post("/add", protect, addUser);
router.post("/update", protect, updateUser);
router.post("/list", protect, listUsers);

module.exports = router;
