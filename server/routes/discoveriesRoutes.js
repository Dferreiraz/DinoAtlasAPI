const router = require("express").Router();
const discoveriesController = require("../controllers/discoveriesController");

router.get("/", discoveriesController.getAllDiscoveries);
router.get("/:id", discoveriesController.getDiscoveryById);

module.exports = router;