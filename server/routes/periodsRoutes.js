const router = require("express").Router();
const periodsController = require("../controllers/periodsController");

router.get("/", periodsController.getAllPeriods);
router.get("/:id", periodsController.getPeriodById);

module.exports = router;