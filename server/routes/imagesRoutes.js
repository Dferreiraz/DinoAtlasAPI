const router = require("express").Router();
const imagesController = require("../controllers/imagesController");

router.get("/", imagesController.getAllImages);
router.get("/:id", imagesController.getImageById);

module.exports = router;