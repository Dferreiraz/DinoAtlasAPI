const router = require("express").Router();
const formationsController = require("../controllers/formationsController");
const { validateId } = require("../middleware/validator");

router.get("/", formationsController.getAllFormations);
router.get("/:id/dinosaurs", validateId, formationsController.getDinosaursByFormation);
router.get("/:id", validateId, formationsController.getFormationById);

module.exports = router;
