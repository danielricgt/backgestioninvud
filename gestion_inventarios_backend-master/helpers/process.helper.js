const { selectDB, insertDB, updateDB } = require('../database/crud.utils');
const { processType } = require('../models/process.enum');
const fs = require("fs");
const fs_x = require("fs-extra");
const pup = require("puppeteer");
const hbs = require("handlebars");
const path = require("path");

const createProcessNotification = (data) => {
  return new Promise(async(resolve, reject) => {
    const query = `START TRANSACTION;
        INSERT INTO procesos (descripcion, razon, hash, hash_ipfs, contratista, bienes, fk_usuario, fk_estado, cambios)
        VALUES (:descripcion, :razon, :hash, :hash_ipfs, :contratista, :bienes, :fk_usuario, :fk_estado, :cambios)
        RETURNING id;
        INSERT INTO notificaciones (fk_usuario_destino, fk_usuario_origen, fk_proceso, fk_estado, fk_tipo_solicitud)
        VALUES (:fk_usuario_destino, :fk_usuario_origen, currval('procesos_id_seq'), 1, :fk_tipo_solicitud);
        -- RETURNING *;
        COMMIT;`
    await insertDB(query, data)
      .catch(err => {
        reject(err);
      })
    resolve(true);
  })
}

const getProcessChanges = (id) => {
  return new Promise(async(resolve, reject) => {
    const query = `SELECT p.cambios, n.id
        FROM procesos AS p
        INNER JOIN notificaciones n on p.id = n.fk_proceso
        WHERE p.id = :id`;
    const [changes] = await selectDB(query, { id })
      .catch(err => {
        resolve(null);
      })
    if (!changes || !changes.id || !changes.cambios.bienes) {
      return resolve(null)
    }
    resolve(changes);
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
        if(type === processType.TRASLADO_DEPENDENCIA && good.fk_usuario) idUser = good.fk_usuario
      })
      if(idUser) await updateDependencyManager({ id: good.fk_usuario, fk_rol: 3 })
    resolve(true);
  })
}

const updateProcessNotification = (data) => {
  return new Promise(async(resolve, reject) => {
    const { status, idNotification, idProcess } = data;
    const updateAlertProcess = `START TRANSACTION;
      UPDATE notificaciones SET fk_estado = :status
      WHERE id = :idNotification;
      UPDATE procesos SET fk_estado = :status
      WHERE id = :idProcess;
      COMMIT;`;
    await updateDB(updateAlertProcess, { status, idNotification, idProcess })
      .catch(err => {
        reject(err);
      })
    resolve(true);
  })
}

const updateDependencyManager = (data) => {
  return new Promise(async(resolve, reject) => {
    const { id, fk_rol } = data;
    const updateAlertProcess = `
      UPDATE usuario_auth SET fk_rol = :fk_rol
      WHERE fk_usuario = :id;`;
    await updateDB(updateAlertProcess, { id, fk_rol })
      .catch(err => {
        reject(err);
      })
    resolve(true);
  })
}

const generateDocument = (data) => {
  return new Promise(async(resolve, reject) => {
    const browser = await pup.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const content = await compile('remision_', data)

    await page.setContent(content) //('<h1>holi</h1>');
    await page.emulateMedia('screen');
    await page.pdf({
      // path: 'ex.pdf',
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div style=\"margin-left:1.5cm; margin-right:1.5cm; margin-top: 2cm; magin-bottom: 1.5cm; font-size:12px; display:flex; flex-direction:row; justify-content:space-between; width:100%;\">",
      footerTemplate: "N/A",
      printBackground: true,
      margin: {
        top: "2cm",
        right: "1.5cm",
        bottom: "1.5cm",
        left: "1.5cm"
      }
    });
    return resolve(page.pdf())
      // await browser.close()
  })
}

const compile = async(template, data) => {
  const fPath = await path.join(__dirname + '../../../public/', `${template}.html`);
  const html = await fs_x.readFile(fPath, 'utf-8');
  return hbs.compile(html)(data);
}

const now = () => {
  return new Date().toLocaleDateString()
}

const format = (items) => {
  let i = 1
  let new_items = []
  for (let item of items) {
    item.number = i++;
    new_items.push(item);
  }
  return new_items;
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

module.exports = {
  createProcessNotification,
  getProcessChanges,
  updateAffectedGoods,
  updateProcessNotification,
  generateDocument
}