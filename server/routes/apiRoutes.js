const router = require("express").Router();
const apiController = require("../controllers/apiController");

router.get("/", apiController.getApiInfo);

router.get("/status", apiController.getStatus);
router.get("/statistics", apiController.getStatistics);

module.exports = router;