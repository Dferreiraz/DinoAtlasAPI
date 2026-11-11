const router = require("express").Router();
const museumsController = require("../controllers/museumsController");
const { validateId } = require("../middleware/validator");

router.get("/", museumsController.getAllMuseums);
router.get("/:id", validateId, museumsController.getMuseumById);

module.exports = router;
