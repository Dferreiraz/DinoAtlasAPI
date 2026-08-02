const router = require("express").Router();
const cladesController = require("../controllers/cladesController");

router.get("/", cladesController.getAllClades);
router.get("/:id", cladesController.getCladeById);

module.exports = router;