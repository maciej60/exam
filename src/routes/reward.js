const router = require("express").Router();
const { fetch } = require("../controllers/reward");
const { protect } = require("../middleware/auth");

router.get("/fetch", protect, fetch);

module.exports = router;
