const router = require("express").Router();
const habitatsController = require("../controllers/habitatsController");

router.get("/", habitatsController.getAllHabitats);
router.get("/:id", habitatsController.getHabitatById);

module.exports = router;