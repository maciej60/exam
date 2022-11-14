const router = require("express").Router();
const {
  users,
  add
} = require("../controllers/user");
const { protect, guardExternalRequests } = require("../middleware/auth");

router.post("/add", protect, add);

router.get("/users", protect, users);

module.exports = router;
