const router = require("express").Router();
const dinosaursController = require("../controllers/dinosaursController");
const imagesController = require("../controllers/imagesController");

router.get("/", dinosaursController.getAllDinosaurs);
router.get("/:id", dinosaursController.getDinosaurById);
router.get("/name/:name", dinosaursController.getDinosaurByName);

router.get("/:id/images", imagesController.getImagesByDinosaur);

module.exports = router;