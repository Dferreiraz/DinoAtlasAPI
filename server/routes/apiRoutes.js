const router = require("express").Router();
const apiController = require("../controllers/apiController");

router.get("/", apiController.getApiInfo);

module.exports = router;