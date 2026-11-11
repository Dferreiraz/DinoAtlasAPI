const router = require("express").Router();
const countriesController = require("../controllers/countriesController");
const { validateId } = require("../middleware/validator");

router.get("/", countriesController.getAllCountries);
router.get("/:id/dinosaurs", validateId, countriesController.getDinosaursByCountry);
router.get("/:id", validateId, countriesController.getCountryById);

module.exports = router;
