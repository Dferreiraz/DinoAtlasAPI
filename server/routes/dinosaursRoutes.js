const router = require("express").Router();
const dinosaursController = require("../controllers/dinosaursController");

router.get("/", dinosaursController.getAllDinosaurs);
router.get("/:id", dinosaursController.getDinosaurById);
router.get("/name/:name", dinosaursController.getDinosaurByName);

module.exports = router;