const router = require("express").Router();
const dietsController = require("../controllers/dietsController");
const { validateId } = require("../middleware/validator");

router.get("/", dietsController.getAllDiets);
router.get("/:id", validateId, dietsController.getDietById);

module.exports = router;
