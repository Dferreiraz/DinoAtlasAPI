const router = require("express").Router();
const epochsController = require("../controllers/epochsController");
const { validateId } = require("../middleware/validator");

router.get("/", epochsController.getAllEpochs);
router.get("/:id", validateId, epochsController.getEpochById);

module.exports = router;
