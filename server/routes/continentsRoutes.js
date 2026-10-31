const router = require("express").Router();
const continentsController = require("../controllers/continentsController");

router.get("/", continentsController.getAllContinents);
router.get("/:id", continentsController.getContinentById);
router.get("/:id/dinosaurs", continentsController.getDinosaursByContinent);

module.exports = router;