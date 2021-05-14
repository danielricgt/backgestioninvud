const blockchain = require("../tools/blockchain");
const { processType } = require('../models/process.enum');
const { createProcessNotification, getProcessChanges, updateAffectedGoods, updateProcessNotification, generateDocument } = require('../helpers/process.helper')
const jwt = require('jsonwebtoken')

async function createHashProcess(req, res) {
  let process = req.objects.process;
  console.log("data  enviada: ", process);
  let contract = await blockchain.smartContract("PROCESS");
  let hash = await blockchain.createHashProceso(
    contract,
    process.id,
    process.start_date,
    process.end_date,
    process.description,
    process.reason,
    process.hashb,
    process.fk_person,
    process.fk_good,
    process.hash_ipfs
  );
  console.log("response", hash);
  res.json({ create: `${hash}` });
}

async function getHashProcess(req, res) {
  let contract = await blockchain.smartContract("PROCESS");
  let hash = await blockchain.getHashProcesos(contract);
  res.json({ hash: `${hash}` });
}

async function createToken(req, res) {
  const sede = jwt.sign({ id: '134' }, process.env.SECRET_SEED, { expiresIn: process.env.TOKEN_EXP });
  // const sede = await selectDB(query)
  // .catch(err => {
  //     return err;
  // })
  console.log(sede)
  res.json(sede)
}

async function createNotificationProcess(req, res) {
  const {data} = req.objects;
  const vars = {
    descripcion: data.descripcion,
    razon: data.razon,
    hash: '',
    hash_ipfs: '',
    contratista: data.contratista,
    bienes: JSON.stringify(data.bienes),
    fk_usuario: data.fk_usuario,
    fk_estado: 1,
    cambios: JSON.stringify(data.cambios),
    fk_usuario_destino: 1, // TODO: search for the approval user
    fk_usuario_origen: data.fk_usuario,
    fk_tipo_solicitud: data.fk_tipo_solicitud,
  }
  await createProcessNotification(vars)
  .catch(err => {
    return res.status(500).json({
      status: 500,
      data: { error: JSON.stringify(err) },
      message: `error updating process`,
    })
  })
  return res.status(201).json({
    status: 201,
    data: {},
    message: `process successfully created`,
  })
}

async function acceptRejectProcess(req, res) {
    const {data} = req.objects;
    if (!data.status || !data.idProcess || !data.processType) {
      return res.status(400).json({
        status: 400,
        data: {},
        message: `invalid request`,
      })
    }
    const idProcess = data.idProcess
    const status = data.status
    const changes = await getProcessChanges(idProcess);
    if (!changes) {
      return res.status(404).json({
        status: 404,
        data: {},
        message: `process not found`,
      })
    }
    const affectedGoods = changes.cambios.bienes
    const idNotification = changes.id
    
    if (status === 3 && (data.processType === processType.BAJA_BIEN || data.processType === processType.ALTA_BIEN)){
      await updateAffectedGoods(affectedGoods, data.processType, false)
      .catch(err => {
        return res.status(500).json({
          status: 500,
          data: { error: JSON.stringify(err) },
          message: `error updating some goods`,
        })
      })
    }
    else if (status === 9) {
      await updateAffectedGoods(affectedGoods, data.processType)
      .catch(err => {
        return res.status(500).json({
          status: 500,
          data: { error: JSON.stringify(err) },
          message: `error updating some goods`,
        })
      })
    }
    await updateProcessNotification({status, idNotification, idProcess})
    .catch(err => {
      console.log(err)
      return res.status(500).json({
        status: 500,
        data: { error: JSON.stringify(err) },
        message: `error updating process`,
      })
    })
    console.log(5)
    return res.status(200).json({
      status: 200,
      data: {},
      message: `process successfully updated`,
    })
}

module.exports = {
  createHashProcess,
  getHashProcess,
  createNotificationProcess,
  acceptRejectProcess,
  createToken
};