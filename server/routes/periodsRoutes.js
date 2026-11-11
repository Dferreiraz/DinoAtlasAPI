const router = require("express").Router();
const periodsController = require("../controllers/periodsController");
const { validateId } = require("../middleware/validator");

router.get("/", periodsController.getAllPeriods);
router.get("/:id", validateId, periodsController.getPeriodById);

module.exports = router;
