const router = require("express").Router();
const familiesController = require("../controllers/familiesController");

router.get("/", familiesController.getAllFamilies);
router.get("/:id", familiesController.getFamilyById);

module.exports = router;