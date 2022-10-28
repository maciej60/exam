const router = require("express").Router();
const {
  rrscodes,
  users,
  receipts
} = require("../controllers/report");
const { protect, guardExternalRequests } = require("../middleware/auth");

router.get("/rrscodes", protect, rrscodes);
router.get("/receipts", protect, receipts);
router.get("/users", protect, users);

module.exports = router;
