const fs = require("fs-extra");
const path = require("path");
const circularJSON = require('circular-json');
const { web3 } = require("./web3.config");

module.exports.deploy = async (bytecode, abi, contractName) => {
    try {
        const receiptPath = path.resolve(__dirname,"./receipts", `${contractName}-receipt.json`);
        
        const accounts = await web3.eth.getAccounts();
        await web3.eth.personal.unlockAccount(accounts[0], "", 15000);
        console.log(`deploy account ${accounts[0]}`);

        const result = await new web3.eth.Contract(abi)
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: '6000000'})
        console.log(`Contract address ${result.options.address}`);

        const serialised = circularJSON.stringify(result.options);
        fs.writeJsonSync(receiptPath,result.options);    
        console.log("receipt saved");

        return serialised;
    } catch (error) {
        console.error(error);
        return {error: JSON.stringify(error)};
    }
}

// module.exports.unlockAccount = async () => {
//     console.log(789)
//     const [account] = await web3.eth.getAccounts()
//     console.log(account)
//     await web3.eth.personal.unlockAccount(account, "", 15000);
// }
