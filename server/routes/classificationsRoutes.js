const router = require("express").Router();
const classificationsController = require("../controllers/classificationsController");
const { validateId } = require("../middleware/validator");

router.get("/", classificationsController.getAllClassifications);
router.get("/:id", validateId, classificationsController.getClassificationById);

module.exports = router;
