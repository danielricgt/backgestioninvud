const good = require("../services/good")
const process = require("../services/process")
const { validateData } = require("../middlewares/validation")
const { auth_verify } = require("../middlewares/auth")

exports.getHashBien = [validateData, good.getHashGood];
exports.createHashBien = [validateData, good.createHashGood];

exports.getHashProceso = [validateData, process.getHashProcess];
exports.createHashProceso = [validateData, process.createHashProcess];

exports.createProcess = [validateData, auth_verify, process.createNotificationProcess];
exports.acceptRejectProcess = [validateData, auth_verify, process.acceptRejectProcess];
exports.token = [validateData, process.createToken];
