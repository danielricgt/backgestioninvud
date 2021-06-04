const { web3 } = require("../eth/web3.config");
const abiSmartContractGood = require("../eth/build/hashBienes_abi.json");
const abiSmartContractProcess = require("../eth/build/hashProcesos_abi.json");
const receiptSmartContractGood = require("../eth/receipts/hashBienes-receipt.json");
const receiptSmartContractProcess = require("../eth/receipts/hashProcesos-receipt.json");

async function getBalance(address) {
  try {
    const result = await web3.eth.getBalance(address);
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function balanceUnit(balance, unit) {
  try {
    const result = await web3.utils.fromWei(balance, unit);
    return result;
  } catch (error) {
    console.log(error);
  }
}

function smartContract(contract) {
  let contractAbi;
  let contractAddress;
  switch (contract) {
    case "GOOD":
      contractAbi= abiSmartContractGood; 
      contractAddress = receiptSmartContractGood.address;
      break;
    case "PROCESS":
      contractAbi = abiSmartContractProcess;
      contractAddress = receiptSmartContractProcess.address;
      break;
    }
    return new web3.eth.Contract(contractAbi, contractAddress);
}

async function getHashBien(contract) {
  try {
    return await contract.methods.getHash().call();
  } catch (error) {
    console.log('get hash bien error');
    console.log(error);
    return '';
  }
}

async function createHashBien(data, contract) {
  try {
    const {placa, descripcion, espacio_fisico, sede, marca_serie, estado, responsable, id_responsable} = data;
    const accounts = await web3.eth.getAccounts();
    let transaction = await contract.methods.generateHashVal(placa, descripcion, espacio_fisico, sede, marca_serie, estado, responsable, id_responsable)
    .send({ from: accounts[0], gas: 5000000 });
    const hashGood = await getHashBien(contract);
    return {hashGood, txIdGood: transaction.transactionHash};
  } catch (error) {
    console.log('crear hash bien error');
    console.error(error);
    return {hashGood: '', txIdGood: ''};
  }
}

async function getHashProcesos(contract) {
  try {
    return await contract.methods.getHash().call();
  } catch (error) {
    console.log('get hash proceso error');
    console.log(error);
    return '';
  }
}

async function createHashProceso(data, contract) {
  try {
    const {id_procedimiento, fecha, descripcion, procedimiento, id_responsable, responsable, placa, hash_ipfs} = data;
    const accounts = await web3.eth.getAccounts();
    let transaction = await contract.methods.generateHashVal(id_procedimiento, fecha, descripcion, procedimiento, id_responsable, responsable, placa, hash_ipfs)
    .send({ from: accounts[0], gas: 5000000 })
    const hashProcess = await getHashProcesos(contract);
    return {hashProcess, txIdProcess: transaction.transactionHash};
  } catch (error) {
    console.log('crear hash proceso error');
    console.error(error);
    return {hashProcess: '', txIdProcess: ''};
  }
}

async function createHash(data, targetContract) {
  // console.log("data  recibida: ", data);
  let hash = '';
  let txId = '';
  const contract = await smartContract(targetContract);
  if (targetContract === "PROCESS") {
    const {hashProcess, txIdProcess} = await createHashProceso(data, contract);
    hash = hashProcess;
    txId = txIdProcess;
  }
  else if (targetContract === "GOOD") {
   const {hashGood, txIdGood} = await createHashBien(data, contract);
    hash = hashGood;
    txId = txIdGood;
  }
  return { hash, txId };
}

async function getHash(targetContract) {
  let hash = '';
  const contract = await smartContract(targetContract);
  if (targetContract === "PROCESS") {
    const hashProcess= await getHashProcesos(contract);
    hash = hashProcess;
  }
  else if (targetContract === "GOOD") {
    const hashGood = await getHashBien(contract);
    hash = hashGood;
  }
  return hash;
}

module.exports = {
  createHash,
  getHash
};
