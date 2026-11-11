const router = require("express").Router();
const habitatsController = require("../controllers/habitatsController");
const { validateId } = require("../middleware/validator");

router.get("/", habitatsController.getAllHabitats);
router.get("/:id", validateId, habitatsController.getHabitatById);

module.exports = router;
