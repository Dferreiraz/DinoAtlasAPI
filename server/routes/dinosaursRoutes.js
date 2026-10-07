const router = require("express").Router();
const dinosaursController = require("../controllers/dinosaursController");
const imagesController = require("../controllers/imagesController");
const { validateId, validatePaginationAndLimits } = require("../middleware/validator");

router.get("/", validatePaginationAndLimits, dinosaursController.getAllDinosaurs);
router.get("/random", validatePaginationAndLimits, dinosaursController.getRandomDinosaurs);

router.get("/:id", validateId, dinosaursController.getDinosaurById);
router.get("/name/:name", dinosaursController.getDinosaurByName);
router.get("/:id/images", validateId, imagesController.getImagesByDinosaur);

module.exports = router;