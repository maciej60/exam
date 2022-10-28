const router = require("express").Router();
const {
  add,
  update,
  select,
  pickWinners,
  lock,
  all,
  single,
  rewarded,
  nonRewarded,
  deleteDraw
} = require("../controllers/draw");
const { protect } = require("../middleware/auth");

router.post("/add", protect, add);
router.post("/update", protect, update);
router.get("/nonRewardedDraws", protect, nonRewarded);
router.get("/allDraws", protect, all);
router.get("/singleDraw/:id?", protect, single);
router.get("/rewardedDraws", protect, rewarded);
router.post("/select", protect, select);
router.post("/pickWinners", protect, pickWinners);
router.post("/lock", protect, lock);
router.post("/delete", protect, deleteDraw);

module.exports = router;
