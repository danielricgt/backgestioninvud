const fs = require("fs-extra");
const path = require("path");
const solc = require("solc");

module.exports.compile = (contractName) => {
    let contract = '';
    if (contractName === 'GOOD') contract = "hashBienes";
    else if (contractName === 'PROCESS') contract = "hashProcesos";
    else return false;
    try {
        const buildPath = path.resolve(__dirname, "./build");
        // fs.removeSync(buildPath);
        const contractPath = path.resolve(__dirname, "./contracts", `${contract}.sol`);
        const source = fs.readFileSync(contractPath, "utf8");
        const input = {
            language: 'Solidity',
            sources: {
                [`${contract}.sol`] : {
                    content: source
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': [ '*' ]
                    }
                }
            }
        };
        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        // const output = solc.compile(source, 1).contracts[`:${contract}`];
        fs.ensureDirSync(buildPath);
        fs.outputJSONSync(path.resolve(buildPath, `${contract}.json`), output);
        
        let bytecode = '';
        let abi = {};

        for (let contractN in output.contracts[`${contract}.sol`]) {
            bytecode = output.contracts[`${contract}.sol`][contractN].evm.bytecode.object;
            abi = output.contracts[`${contract}.sol`][contractN].abi;
            fs.outputJSONSync(path.resolve(buildPath, `${contract}_abi.json`), abi);
        }
        return { bytecode, abi, contractName: contract }
    } catch (error) {
        console.error(error);
        return {error: JSON.stringify(error)};
    }
};
