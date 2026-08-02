const router = require("express").Router();
const countriesController = require("../controllers/countriesController");

router.get("/", countriesController.getAllCountries);
router.get("/:id", countriesController.getCountryById);

module.exports = router;