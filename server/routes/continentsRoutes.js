const router = require("express").Router();
const continentsController = require("../controllers/continentsController");

router.get("/", continentsController.getAllContinents);
router.get("/:id", continentsController.getContinentById);

module.exports = router;