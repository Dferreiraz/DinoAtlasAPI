const router = require("express").Router();
const classificationsController = require("../controllers/classificationsController");

router.get("/", classificationsController.getAllClassifications);
router.get("/:id", classificationsController.getClassificationById);

module.exports = router;