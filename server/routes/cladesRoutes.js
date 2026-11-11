const router = require("express").Router();
const cladesController = require("../controllers/cladesController");
const { validateId } = require("../middleware/validator");

router.get("/", cladesController.getAllClades);
router.get("/:id", validateId, cladesController.getCladeById);

module.exports = router;
