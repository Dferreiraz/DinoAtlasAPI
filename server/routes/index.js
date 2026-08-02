const router = require("express").Router();

const apiRoutes = require("./apiRoutes");
const dinosaursRoutes = require("./dinosaursRoutes");
const periodsRoutes = require("./periodsRoutes");
const epochsRoutes = require("./epochsRoutes");
const formationsRoutes = require("./formationsRoutes");
const continentsRoutes = require("./continentsRoutes");
const countriesRoutes = require("./countriesRoutes");
const habitatsRoutes = require("./habitatsRoutes");
const dietsRoutes = require("./dietsRoutes");
const familiesRoutes = require("./familiesRoutes");
const cladesRoutes = require("./cladesRoutes");
const classificationsRoutes = require("./classificationsRoutes");
const discoveriesRoutes = require("./discoveriesRoutes");
const museumsRoutes = require("./museumsRoutes");
const imagesRoutes = require("./imagesRoutes");

// Endpoint principal da API (/api)
router.use("/", apiRoutes);

// Endpoints de recursos (/api/recurso)
router.use("/dinosaurs", dinosaursRoutes);
router.use("/periods", periodsRoutes);
router.use("/epochs", epochsRoutes);
router.use("/formations", formationsRoutes);
router.use("/continents", continentsRoutes);
router.use("/countries", countriesRoutes);
router.use("/habitats", habitatsRoutes);
router.use("/diets", dietsRoutes);
router.use("/families", familiesRoutes);
router.use("/clades", cladesRoutes);
router.use("/classifications", classificationsRoutes);
router.use("/discoveries", discoveriesRoutes);
router.use("/museums", museumsRoutes);
router.use("/images", imagesRoutes);

module.exports = router;