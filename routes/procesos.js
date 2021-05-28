const express = require("express");
const router = express.Router();
var controllers = require("../controllers/controller");

// router.get("/process", controllers.createProcess);
router.get("/token", controllers.token)
router.post("/blockchain/process", controllers.createHashProceso);
router.get("/blockchain/processes",controllers.getHashProceso);
router.post("/process/create", controllers.createProcess);
router.post("/process/accept-reject", controllers.acceptRejectProcess);

module.exports = router;