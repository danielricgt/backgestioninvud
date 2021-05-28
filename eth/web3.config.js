const Web3 = require("web3");

console.log(process.env.WEB3_PROVIDER)

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER))

// web3.eth.getAccounts()
// .then(([accounts]) => console.log(accounts))
// .catch(err => console.log(err));

// const eventProvider = new Web3.providers.WebsocketProvider(
//   `ws://${process.env.WEB3_NETWORK}`
// );

// web3.setProvider(eventProvider);

module.exports = {
  web3
};