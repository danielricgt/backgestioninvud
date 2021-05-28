const { selectDB, insertDB, updateDB } = require('../database/crud.utils');
const { createHash } = require('./blockchain');
const { processType } = require('../models/process.enum');

const createProcessNotification = (data) => {
  return new Promise(async(resolve, reject) => {
    const query = `START TRANSACTION;
        INSERT INTO procesos (descripcion, razon, hash, hash_ipfs, contratista, bienes, fk_usuario, fk_estado, cambios)
        VALUES (:descripcion, :razon, :hash, :hash_ipfs, :contratista, :bienes, :fk_usuario, :fk_estado, :cambios)
        RETURNING id;
        INSERT INTO notificaciones (fk_usuario_destino, fk_usuario_origen, fk_usuario_aprobador, fk_proceso, fk_estado, fk_tipo_solicitud)
        VALUES (:fk_usuario_destino, :fk_usuario_origen, :fk_usuario_aprobador, currval('procesos_id_seq'), :fk_estado, :fk_tipo_solicitud);
        -- RETURNING *;
        COMMIT;`
    await insertDB(query, data)
      .catch(err => {
        console.log(err)
        reject(err);
      })
    resolve(true);
  })
}

const getProcessChanges = (id) => {
  return new Promise(async(resolve, reject) => {
    const query = `SELECT p.cambios, n.id, n.fk_usuario_origen
        FROM procesos p
        INNER JOIN notificaciones n ON p.id = n.fk_proceso
        WHERE p.id = :id`;
    const [changes] = await selectDB(query, { id })
      .catch(err => {
        resolve(null);
      })
    if (!changes || !changes.id || !changes.cambios.bienes) {
      return resolve(null);
    }
    resolve(changes);
  })
}

const getAffectedGoodsAndUser = (id) => {
  return new Promise(async(resolve, reject) => {
    const query = `SELECT 
    p.bienes AS idGoods, p.fk_usuario AS iduser, n.fk_usuario_destino, n.fk_usuario_origen, n.fk_usuario_aprobador
    FROM procesos p
    INNER JOIN notificaciones n ON p.id = n.fk_proceso
    WHERE p.id = :id;`;
    const [goods] = await selectDB(query, { id })
      .catch(err => {
        resolve(null);
      })
    if (!goods || !goods.idgoods) {
      return resolve(null);
    }
    resolve(goods);
  })
}

const updateAffectedGoods = (affectedGoods, type, accept = true) => {
  return new Promise(async(resolve, reject) => {
    let idUser = null;
    affectedGoods.map(async(good) => {
      if (!accept && type === processType.BAJA_BIEN) good.fk_estado = 1;
      if (!accept && type === processType.ALTA_BIEN) good.fk_estado = 2;
      const updateGood = `UPDATE bien SET (${Object.keys(good)}) = (${formatValues(Object.values(good))})
          WHERE id = :id`;
      await updateDB(updateGood, { id: good.id })
        .catch(err => {
          reject(err);
        })
      await generateHashGood(good.id);
      if (type === processType.TRASLADO_DEPENDENCIA && good.fk_usuario) idUser = good.fk_usuario;
    })
    if (idUser) {
      await updateuserRole({ id: good.fk_usuario, fk_rol: 3 });
      await updateDependencyManager({ fk_usuario: good.fk_usuario, fk_dependencia: good.fk_dependencia });
    }
    resolve(true);
  })
}

const updateHashGood = (id, hash) => {
  return new Promise(async(resolve, reject) => {
    const updateGood = `UPDATE bien SET hash_bien = '${hash}'
        WHERE id = :id`;
    await updateDB(updateGood, { id })
      .catch(err => {
        resolve(false);
      })
    resolve(true);
  })
}

const updateProcessNotification = (data) => {
  return new Promise(async(resolve, reject) => {
    const { status, idNotification, idProcess, hash, hashIpfs } = data;
    const updateAlertProcess = `START TRANSACTION;
      UPDATE notificaciones SET fk_estado = :status
      WHERE id = :idNotification;
      UPDATE procesos SET (fk_estado, fecha_fin, hash, hash_ipfs) = (:status, now(), :hash, :hashIpfs)
      WHERE id = :idProcess;
      COMMIT;`;
    await updateDB(updateAlertProcess, { status, idNotification, idProcess, hash, hashIpfs })
      .catch(err => {
        reject(err);
      })
    resolve(true);
  })
}

const updateuserRole = (data) => {
  return new Promise(async(resolve, reject) => {
    const { id, fk_rol } = data;
    const updateAlertProcess = `
      UPDATE usuario_auth SET fk_rol = :fk_rol
      WHERE fk_usuario = :id;`;
    await updateDB(updateAlertProcess, { id, fk_rol })
      .catch(err => {
        resolve(null);
      })
    resolve(true);
  })
}

const updateDependencyManager = (data) => {
  return new Promise(async(resolve, reject) => {
    const { fk_usuario, fk_dependencia } = data;
    const updateAlertProcess = `
      UPDATE encargado_dependencia SET fk_usuario = :fk_usuario
      WHERE fk_dependencia = :fk_dependencia;`;
    await updateDB(updateAlertProcess, { fk_usuario, fk_dependencia })
      .catch(err => {
        resolve(null);
      })
    resolve(true);
  })
}

const getResponsibleUser = (id) => {
  return new Promise(async(resolve, reject) => {
    const query = `SELECT
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre, u.id, u.correo, uc.cargo, d.dependencia, s.sede
    FROM usuario u
    INNER JOIN dependencia d ON d.id = u.fk_dependencia
    INNER JOIN sede s ON s.id = d.fk_sede
    INNER JOIN usuario_cargo uc ON u.id = uc.fk_usuario
    WHERE u.id = :id;`;
    const [user] = await selectDB(query, { id })
      .catch(err => {
        resolve(null);
      })
    if (!user) {
      return resolve(null)
    }
    resolve(user);
  })
}

const getBienDetails = (id) => {
  return new Promise(async(resolve, reject) => {
    const query = `SELECT
    b.*, c.*, CONCAT(u.nombres, ' ', u.apellidos) AS responsable,
    d.dependencia, s.sede
    FROM bien AS b
    INNER JOIN comprobante AS c ON c.id = b.fk_comprobante
    LEFT JOIN usuario u on b.fk_usuario = u.id
    LEFT JOIN dependencia d on u.fk_dependencia = d.id
    LEFT JOIN sede s on s.id = d.fk_sede
    WHERE  b.id IN (:id);`;
    const goods = await selectDB(query, { id })
      .catch(err => {
        resolve(null);
      })
    if (!goods || goods.length === 0) {
      return resolve(null)
    }
    resolve(goods);
  })
}

const getProcessDetails = (id) => {
  return new Promise(async(resolve, reject) => {
    const query = `SELECT
    p.id AS id_procedimiento, p.fecha_inicio AS fecha, p.descripcion, ts.solicitud AS procedimiento,
    u.id AS id_responsable, CONCAT(u.nombres, ' ', u.apellidos) AS responsable, p.hash_ipfs, p.bienes
    FROM procesos p
    INNER JOIN usuario u ON u.id = p.fk_usuario
    INNER JOIN notificaciones n ON p.id = n.fk_proceso
    INNER JOIN tipo_solicitud ts ON n.fk_tipo_solicitud = ts.id
    WHERE p.id = :id;`;
    const [process] = await selectDB(query, { id })
      .catch(err => {
        resolve(null);
      })
    if (!process) {
      return resolve(null)
    }
    resolve(process);
  })
}

const getGoodDetails = (id) => {
  return new Promise(async(resolve, reject) => {
    const query = `SELECT
    b.placa, b.descripcion, b.espacio_fisico, s.sede, b.marca_serie, e.estado,
    CONCAT(u.nombres, ' ', u.apellidos) AS responsable, u.id AS id_responsable
    FROM bien b
    LEFT JOIN usuario u ON u.id = b.fk_usuario
    LEFT JOIN dependencia d ON u.fk_dependencia = d.id
    LEFT JOIN estados e ON e.id = b.fk_estado
    LEFT JOIN sede s ON s.id = d.fk_sede
    WHERE b.id = :id;`;
    const [good] = await selectDB(query, { id })
      .catch(err => {
        resolve(null);
      })
    if (!good) {
      return resolve(null)
    }
    resolve(good);
  })
}

const getHashedPlacas = (bienes) => {
  return new Promise(async(resolve, reject) => {
    const query = `SELECT 
    cast(digest(cast(array(SELECT placa FROM bien WHERE id IN (:bienes)) as varchar), 'sha256') AS varchar) 
    AS placa;`;
    const [placa] = await selectDB(query, { bienes })
      .catch(err => {
        resolve('');
      })
    if (!placa || !placa.placa) {
      return resolve('')
    }
    resolve(placa.placa);
  })
}

const createTransaction = (data) => {
  return new Promise(async(resolve, reject) => {
    const query = `
    INSERT INTO transacciones (hash_bc, hash_ipfs, tx_id, fk_proceso, bienes, fk_usuario, ipfs_link)
    VALUES (:hash, :hashIpfs, :txId, :idProcess, :bienes, :idUsuario, :linkIpfs);`
    await insertDB(query, data)
      .catch(err => {
        resolve(false)
      })
    resolve(true);
  })
}

const getCWOId = () => {
  return new Promise(async(resolve, reject) => {
    const query = `
    SELECT ua.fk_usuario
    FROM usuario_auth ua
    WHERE ua.fk_rol = 2 AND fk_usuario != 1;`
    const [user] = await selectDB(query)
      .catch(err => {
        resolve('')
      })
    if (!user || !user.fk_usuario) return resolve('')
    resolve(user.fk_usuario);
  })
}

const getCWO = () => {
  return new Promise(async(resolve, reject) => {
    const query = `
    SELECT CONCAT(u.nombres, ' ', u.apellidos) AS nombre, u.id
    FROM usuario u
    INNER JOIN usuario_auth ua ON ua.fk_usuario = u.id
    WHERE ua.fk_rol = 2 AND fk_usuario != 1;`
    const [user] = await selectDB(query)
      .catch(err => {
        resolve('')
      })
    if (!user || !user.fk_usuario) return resolve({})
    resolve(user);
  })
}

const getDependencyManagerId = (id) => {
  return new Promise(async(resolve, reject) => {
    const query = `
    SELECT ed.fk_usuario
    FROM encargado_dependencia ed
    INNER JOIN usuario u on u.id = ed.fk_usuario
    WHERE ed.fk_usuario = :id;`
    const [user] = await selectDB(query, {id})
      .catch(err => {
        resolve('')
      })
    if (!user || !user.fk_usuario) return resolve('')
    resolve(user.fk_usuario);
  })
}

const formatValues = (values = []) => {
  const formatedValues = []
  values.map(value => {
    if (typeof(value) === 'string') {
      value = `'${value}'`
    }
    formatedValues.push(value)
  })
  return formatedValues
}

const getProcessData = async(idProcess) => {
  const hashData = await getProcessDetails(idProcess)
  if (!hashData || !hashData.bienes) {
    return null
  }
  hashData.placa = await getHashedPlacas(hashData.bienes)
  return hashData
}

const generateHashGood = async(id) => {
  const hashData = await getGoodDetails(id);
  const { hash } = await createHash(hashData, "GOOD");
  await updateHashGood(id, hash);
  return hash;
}

module.exports = {
  createProcessNotification,
  getProcessChanges,
  updateAffectedGoods,
  updateProcessNotification,
  getProcessData,
  createTransaction,
  generateHashGood,
  getAffectedGoodsAndUser,
  getBienDetails,
  getResponsibleUser,
  getCWOId,
  getDependencyManagerId,
  updateuserRole,
  getCWO
}