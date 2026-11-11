const router = require("express").Router();
const dinosaursController = require("../controllers/dinosaursController");
const imagesController = require("../controllers/imagesController");
const {
  validateId,
  validatePaginationAndLimits,
  validateRandomLimit,
  validateSorting,
  validateSearch,
  validateFilters,
  validateNameParam
} = require("../middleware/validator");

router.get(
  "/",
  validatePaginationAndLimits,
  validateSorting,
  validateSearch,
  validateFilters,
  dinosaursController.getAllDinosaurs
);

router.get("/random", validateRandomLimit, dinosaursController.getRandomDinosaurs);
router.get("/name/:name", validateNameParam, dinosaursController.getDinosaurByName);
router.get("/:id/images", validateId, imagesController.getImagesByDinosaur);
router.get("/:id", validateId, dinosaursController.getDinosaurById);

module.exports = router;
