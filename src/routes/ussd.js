const router = require('express').Router();
const { getrrs, jobCaller, jobExecutor } = require("../controllers/ussd");

router.post("/jobCall", jobCaller);
router.post("/jobExec", jobExecutor);
router.post("/getrrs", getrrs);

module.exports = router;
