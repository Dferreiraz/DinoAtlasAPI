const router = require("express").Router();
const epochsController = require("../controllers/epochsController");

router.get("/", epochsController.getAllEpochs);
router.get("/:id", epochsController.getEpochById);

module.exports = router;