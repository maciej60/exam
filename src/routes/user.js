const router = require("express").Router();
const {
  taxPayersFromRevotax,
  userRrs,
  userStats,
  userItems,
  userReceipts,
  userRewards,
  userMonthYearRrs,
  userTotalMonthlyReceipts,
  userHighestReceipt,
  adminStats,
  adminTopMonthReceipts,
  monthlyRrs,
  users,
  add
} = require("../controllers/user");
const { protect, guardExternalRequests } = require("../middleware/auth");

router.post("/taxPayersFromRevotax", guardExternalRequests, taxPayersFromRevotax);
router.post("/add", protect, add);
router.get("/userRrs", protect, userRrs);
router.get("/userReceipts", protect, userReceipts);
router.get("/userRewards", protect, userRewards);
router.get("/userMonthYearRrs", protect, userMonthYearRrs);
router.get("/userTotalMonthlyReceipts", protect, userTotalMonthlyReceipts);
router.post("/userStats", protect, userStats);
router.post("/userItems", protect, userItems);
router.get("/userHighestReceipt", protect, userHighestReceipt);

router.post("/adminStats", protect, adminStats);
router.get("/adminTopMonthReceipts", protect, adminTopMonthReceipts);
router.get("/monthlyRrs", protect, monthlyRrs);
router.get("/users", protect, users);

module.exports = router;
