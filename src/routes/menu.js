const router = require('express').Router();
const {
    test,
    addSystemMenu,
    addInstitutionMenu,
    addUserMenu,
    getSystemMenu,
    getInstitutionMenu,
    getUserMenu,
} = require("../controllers/menu");

const { protect } = require("../middleware/auth");

router.post('/test', test);
router.post('/addSystemMenu', protect, addSystemMenu);
router.post('/addInstitutionMenu', protect, addInstitutionMenu);
router.post("/addUserMenu", protect, addUserMenu);
router.post("/getSystemMenu", protect, getSystemMenu);
router.post("/getInstitutionMenu", protect, getInstitutionMenu);
router.post("/getUserMenu", protect, getUserMenu);

module.exports = router;
