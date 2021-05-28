const {compile} = require('../eth//compile');
const {deploy, unlockAccount} = require("../eth/deploy")

async function compileDeployContract(req, res) {
  const { data } = req.objects;
  const contract = data.contract;
  if (!['PROCESS', 'GOOD'].includes(contract)) {
    return res.status(400).json({
      status: 400,
      data: { },
      message: `contract not supported`,
    })
  }
  let deployResponse = {}
  const { bytecode, abi, contractName } = compile("PROCESS");
  deployResponse = await deploy(bytecode, abi, contractName);
  if (deployResponse.error) {
    return res.status(500).json({
      status: 500,
      data: { error: deployResponse.error },
      message: `error deploying contract`,
    })
  }
  return res.status(201).json({
    status: 201,
    data: deployResponse,
    message: `contract successfully deployed`,
  })
}

// async function unlockAccounts(req, res) {
//   console.log(123)
//   await unlockAccount();
//   return res.status(201).json({
//     status: 201,
//     data: deployResponse,
//     message: `contract successfully deployed`,
//   })
// }

module.exports = {
    compileDeployContract,
    // unlockAccounts
}