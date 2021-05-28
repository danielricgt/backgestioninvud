const good = require("../services/good");
const process = require("../services/process");
const contract = require("../services/contracts");
const { validateData } = require("../middlewares/validation");
const { auth_verify } = require("../middlewares/auth");

exports.getHashBien = [validateData, good.getHashGood];
exports.hashGood = [validateData, good.hashGood];
// exports.createHashBien = [validateData, good.createHashGood];

exports.getHashProceso = [validateData, process.getHashProcess];
exports.createHashProceso = [validateData, process.createHashProcess];

exports.createProcess = [validateData, auth_verify, process.createNotificationProcess];
exports.acceptRejectProcess = [validateData, auth_verify, process.acceptRejectProcess];
exports.token = [validateData, process.createToken];

exports.compileDeployContract = [validateData, contract.compileDeployContract];
// exports.unlockAccount = [validateData, contract.unlockAccounts];
