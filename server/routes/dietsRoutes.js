const router = require("express").Router();
const dietsController = require("../controllers/dietsController");

router.get("/", dietsController.getAllDiets);
router.get("/:id", dietsController.getDietById);

module.exports = router;