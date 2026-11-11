const router = require("express").Router();
const discoveriesController = require("../controllers/discoveriesController");
const { validateId } = require("../middleware/validator");

router.get("/", discoveriesController.getAllDiscoveries);
router.get("/:id", validateId, discoveriesController.getDiscoveryById);

module.exports = router;
