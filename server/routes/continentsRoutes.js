const router = require("express").Router();
const continentsController = require("../controllers/continentsController");
const { validateId } = require("../middleware/validator");

router.get("/", continentsController.getAllContinents);
router.get("/:id/dinosaurs", validateId, continentsController.getDinosaursByContinent);
router.get("/:id", validateId, continentsController.getContinentById);

module.exports = router;
