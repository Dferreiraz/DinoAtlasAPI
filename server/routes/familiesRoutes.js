const router = require("express").Router();
const familiesController = require("../controllers/familiesController");
const { validateId } = require("../middleware/validator");

router.get("/", familiesController.getAllFamilies);
router.get("/:id", validateId, familiesController.getFamilyById);

module.exports = router;
