const router = require("express").Router();
const museumsController = require("../controllers/museumsController");

router.get("/", museumsController.getAllMuseums);
router.get("/:id", museumsController.getMuseumById);

module.exports = router;