const express = require("express");
const router = express.Router();
var controllers = require("../controllers/controller");

router.post("/contract/deploy", controllers.compileDeployContract);
// router.get("/contract/unlock", controllers.unlockAccount);

module.exports = router;