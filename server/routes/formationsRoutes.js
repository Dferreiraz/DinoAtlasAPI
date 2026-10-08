const router = require("express").Router();
const formationsController = require("../controllers/formationsController");

router.get("/", formationsController.getAllFormations);
router.get("/:id", formationsController.getFormationById);
router.get("/:id/dinosaurs", formationsController.getDinosaursByFormation);

module.exports = router;