const { createHash, getHash } = require("../helpers/blockchain");
const { processType } = require('../models/process.enum');
const { createProcessNotification, getProcessChanges, updateAffectedGoods, updateProcessNotification, getProcessData, createTransaction, getCWOId, getDependencyManagerId, updateuserRole } = require('../helpers/process.helper');
const { createDocument } = require("../helpers/generateDocuments")

async function createHashProcess(req, res) {
  const { data } = req.objects;
  const process = {
      id_procedimiento: data.id_procedimiento,
      fecha: data.fecha,
      descripcion: data.descripcion,
      procedimiento: data.procedimiento,
      id_responsable: data.id_responsable,
      responsable: data.responsable,
      placa: data.placa,
      hash_ipfs: data.hash_ipfs,
    }
    // console.log("data  enviada: ", process);
  const { hash, txId } = await createHash(process, data.contract);
  res.json({ hash, txId });
}

async function getHashProcess(req, res) {
  const { data } = req.objects;
  const hash = await getHash(data.contract);
  res.json({ hash });
}

async function createToken(req, res) {
  // const sede = jwt.sign({ id: '134' }, process.env.SECRET_SEED, { expiresIn: "process.env.TOKEN_EXP })";
  // // const sede = await selectDB(query)
  // // .catch(err => {
  // //     return err;
  // // })
  // // let x = await getBienDetails([11,14,15])
  // // console.log(x)
  // compile("GOOD");
  // console.log(sede)
  // res.json(sede)

  // const {data} = req.objects;
  // const hash = await getHash("GOOD");
  // res.json({ hash });

  // const hashData = await getProcessData(23);
  // console.log(hashData)
  //   let hash = '';
  //   let hashIpfs = '';
  //   let txId = '';
  //   let  bienes = [];
  //   if (hashData) {
  //     bienes = hashData.bienes;
  //     delete hashData.bienes;
  //     const transaction = await createHash(hashData, "PROCESS");
  //     hash = transaction.hash;
  //     txId = transaction.txId; 
  //   }
  //   await createTransaction({hash, hashIpfs, txId, idProcess: 23, bienes: JSON.stringify(bienes), idUsuario: 1});
  //   console.log(hash, txId)
  // res.json({ hash });
  // await createDocumentDropGood(17)
  // await createDocumentEntryGood(17)
  // await createDocumentDepartureGood(17)
  // await createDocumentLiftingGood(17)
  // await createDocument(5, 17);
}

async function createNotificationProcess(req, res) {
  const { data } = req.objects;
  const usuarioDestino = data.fk_tipo_solicitud !== processType.TRASLADO_BIENES_INDIVIDUALES ? await getCWOId() : await getDependencyManagerId(data.fk_usuario);
  const usuarioAprobador = data.fk_tipo_solicitud !== processType.TRASLADO_BIENES_INDIVIDUALES ? await getCWOId() : await getDependencyManagerId(data.fk_usuario);
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
    fk_usuario_destino: data.fk_usuario_destino ? data.fk_usuario_destino : usuarioDestino,
    fk_usuario_aprobador: data.fk_usuario_aprobador ? data.fk_usuario_aprobador : usuarioAprobador,
    fk_usuario_origen: data.fk_usuario,
    fk_tipo_solicitud: data.fk_tipo_solicitud,
  }
  await createProcessNotification(vars)
    .catch(err => {
      return res.status(500).json({
        status: 500,
        data: { error: JSON.stringify(err) },
        message: `error creating process`,
      })
    })
  return res.status(201).json({
    status: 201,
    data: {},
    message: `process successfully created`,
  })
}

// async function acceptRejectProcess(req, res) {}

// async function acceptRejectProcess(req, res) {
//   const { data } = req.objects;
//   console.log(123)
//     // data.status = 9;
//     // data.idProcess = 32;
//     // data.processType = 3;
//   if (!data.status || !data.idProcess || !data.processType) {
//     return res.status(400).json({
//       status: 400,
//       data: {},
//       message: `invalid request`,
//     })
//   }
//   const idProcess = data.idProcess
//   const status = data.status
//   const changes = await getProcessChanges(idProcess);
//   if (!changes) {
//     return res.status(404).json({
//       status: 404,
//       data: {},
//       message: `process not found`,
//     })
//   }
//   const affectedGoods = changes.cambios.bienes
//   const idNotification = changes.id

//   let hash = '';
//   let txId = '';
//   let bienes = [];
//   let hashIpfs = '';
//   let linkIpfs = '';
//   let idUsuario = null;

//   if (status === 3 && (data.processType === processType.BAJA_BIEN || data.processType === processType.ALTA_BIEN)) {
//     await updateAffectedGoods(affectedGoods, data.processType, false)
//       .catch(err => {
//         return res.status(500).json({
//           status: 500,
//           data: { error: JSON.stringify(err) },
//           message: `error updating some goods`,
//         })
//       })
//   } else if (status === 9) {
//     await updateAffectedGoods(affectedGoods, data.processType)
//       .catch(err => {
//         return res.status(500).json({
//           status: 500,
//           data: { error: JSON.stringify(err) },
//           message: `error updating some goods`,
//         })
//       });
//     const hashData = await getProcessData(idProcess);
//     if (hashData) {
//       bienes = hashData.bienes;
//       idUsuario = hashData.id_responsable
//       delete hashData.bienes;
//       const transaction = await createHash(hashData, "PROCESS");
//       const documentData = await createDocument(data.processType, idProcess);
//       hashIpfs = documentData.hashIpfs;
//       linkIpfs = documentData.linkIpfs;
//       hash = transaction.hash;
//       txId = transaction.txId;
//     }
//     await createTransaction({ hash, hashIpfs, txId, idProcess, bienes: JSON.stringify(bienes), idUsuario, linkIpfs }); // TODO: add linkIpfs field to tx table
//   }

//   await updateProcessNotification({ status, idNotification, idProcess, hash, hashIpfs })
//     .catch(err => {
//       console.log(err)
//       return res.status(500).json({
//         status: 500,
//         data: { error: JSON.stringify(err) },
//         message: `error updating process`,
//       })
//     })
//   console.log(8897)
//   return res.status(200).json({
//     status: 200,
//     data: {},
//     message: `process successfully updated`,
//   })
// }

async function acceptRejectProcess(req, res) {
  const { data } = req.objects;
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

  let hash = '';
  let txId = '';
  let bienes = [];
  let hashIpfs = '';
  let linkIpfs = '';
  let idUsuario = null;
  try {

    if (status === 3 && (data.processType === processType.BAJA_BIEN || data.processType === processType.ALTA_BIEN)) {
      await updateAffectedGoods(affectedGoods, data.processType, false)
    } else if (status === 9) {
      await updateAffectedGoods(affectedGoods, data.processType)
      if (data.processType === processType.TRASLADO_DEPENDENCIA ) updateuserRole({ id: changes.fk_usuario_origen, fk_rol: 4 })
      const hashData = await getProcessData(idProcess);
      if (hashData) {
        bienes = hashData.bienes;
        idUsuario = hashData.id_responsable
        delete hashData.bienes;
        const transaction = await createHash(hashData, "PROCESS");
        const documentData = await createDocument(data.processType, idProcess);
        hashIpfs = documentData.hashIpfs;
        linkIpfs = documentData.linkIpfs;
        hash = transaction.hash;
        txId = transaction.txId;
      }
      await createTransaction({ hash, hashIpfs, txId, idProcess, bienes: JSON.stringify(bienes), idUsuario, linkIpfs }); // TODO: add linkIpfs field to tx table
    }
  
    await updateProcessNotification({ status, idNotification, idProcess, hash, hashIpfs })
    
  } catch (error) {
    return res.status(500).json({
      status: 500,
      data: { error: JSON.stringify(err) },
      message: `internal server error`,
    })
  }
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