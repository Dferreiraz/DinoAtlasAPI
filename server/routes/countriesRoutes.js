const router = require("express").Router();
const countriesController = require("../controllers/countriesController");

router.get("/", countriesController.getAllCountries);
router.get("/:id", countriesController.getCountryById);
router.get("/:id/dinosaurs", countriesController.getDinosaursByCountry);

module.exports = router;