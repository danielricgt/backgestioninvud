const ipfsAPI = require("ipfs-api");
const CID = require("cids");
const fs = require("fs");
const path = require("path");

const ipfs = ipfsAPI(process.env.IPFS_PROVIDER, process.env.IPFS_PORT, { protocol: 'https' });

module.exports.generateIpfs = async(documentName) => {
  const documentPath = path.resolve(__dirname, "../documents", documentName);
  const document = fs.readFileSync(documentPath);
  const documentBuffer = Buffer.from(document);

  const [resp] = await ipfs.files.add(documentBuffer)
    .catch(error => {
      console.error(error);
      return {};
    });

  const hashIpfs = resp.hash;
  const linkIpfs = `https://ipfs.io/ipfs/${resp.hash}`;
  fs.unlinkSync(documentPath);
  return { hashIpfs, linkIpfs }
}

const buildIpfsLink = (value) => {
  const cid = new CID(value)
  const ipfsCid = cid.toV1().toBaseEncodedString('base32');
  return `https://${ipfsCid}.ipfs.dweb.link/`
}