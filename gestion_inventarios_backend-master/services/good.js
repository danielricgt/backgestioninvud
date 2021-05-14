const blockchain = require("../tools/blockchain");

async function createHashGood(req, res) {
  let good = req.objects.good;
  console.log("data  enviada: ", good);
  let contract = await blockchain.smartContract("GOOD");
  let hash = await blockchain.createHashBien(
    contract,
    good.id,
    good.descripcion,
    good.placa,
    good.sede,
    good.inventory,
    good.space,
    good.marcaserie,
    good.state
  );
  console.log("response", hash);
  res.json({ create: `${hash}` });
}

async function getHashGood(req, res) {
  let contract = await blockchain.smartContract("GOOD");
  let hash = await blockchain.getHashBien(contract);
  res.json({ hash: `${hash}` });
}

module.exports = {
  createHashGood,
  getHashGood,
};