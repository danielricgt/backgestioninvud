const fs_x = require("fs-extra");
const pup = require("puppeteer");
const hbs = require("handlebars");
const path = require("path");
const { templates, processType } = require("../models/process.enum");
const { getAffectedGoodsAndUser, getBienDetails, getResponsibleUser, getCWO } = require("./process.helper");
const { generateIpfs } = require("./ipfs");

module.exports.createDocument = async (processT, idProcess) => {
  let documentData = {
    hashIpfs: '',
    linkIpfs: '',
    fileName: ''
  };
  switch (processT) {
    case processType.BAJA_BIEN:
      documentData =  await createDocumentDropGood(idProcess);
      break;

    case processType.INGRESO_BIEN_ENTRADA:
      documentData =  await createDocumentEntryGood(idProcess);
      break;
    
    case processType.INGRESO_BIEN_SALIDA:
      documentData =  await createDocumentDepartureGood(idProcess);
      break;
    
    case processType.LEVANTAMIENTO:
      documentData =  await createDocumentLiftingGood(idProcess);
      break;

    case processType.TRASLADO_BIENES_INDIVIDUALES:
      documentData =  await createTranslateGoods(idProcess);
      break;

    case processType.TRASLADO_DEPENDENCIA:
      documentData =  await createTranslateGoods(idProcess);
      break;
  
    default:
      break;
  }
  return documentData;
}

// generar documento baja de bien
const createDocumentDropGood = async(idProcess) => {
  const { idgoods, iduser } = await getAffectedGoodsAndUser(idProcess);
  const goods = await getBienDetails(idgoods);
  const items = []
  goods.map(async bienes => {
    const goodData = {
      placa: bienes.placa,
      cantidad: bienes.cantidad,
      descripcion: bienes.descripcion,
      observaciones: bienes.observaciones,
    };
    items.push(goodData);
  });
  const usuario = await getResponsibleUser(iduser)
  const data = {
    usuario,
    items,
    now: now(),
  }
  const fileName = `${templates.BAJA_BIEN}-${new Date().getTime()}.pdf`;
  await generateDocument(data, templates.BAJA_BIEN, fileName, true);
  const { hashIpfs, linkIpfs } = await generateIpfs(fileName);
  return { hashIpfs, linkIpfs, fileName };
}

// generar documento comprobante de entrada
const createDocumentEntryGood = async(idProcess) => {
  const { idgoods } = await getAffectedGoodsAndUser(idProcess);
  const [bien] = await getBienDetails(idgoods);
  const jefe = await getCWO();
  bien.fecha_creacion = now(bien.fecha_creacion);
  const data = {
    bien,
    now: now(),
    jefe
  }
  const fileName = `${templates.INGRESO_BIEN_ENTRADA}-${new Date().getTime()}.pdf`;
  await generateDocument(data, templates.INGRESO_BIEN_ENTRADA, fileName);
  const { hashIpfs, linkIpfs } = await generateIpfs(fileName);
  return { hashIpfs, linkIpfs, fileName };
}

// generar documento comprobante de salida
const createDocumentDepartureGood = async(idProcess) => {
  const { idgoods, iduser } = await getAffectedGoodsAndUser(idProcess);
  const [bien] = await getBienDetails(idgoods);
  bien.fecha_creacion = now(bien.fecha_creacion);
  const usuario = await getResponsibleUser(iduser);
  const jefe = await getCWO();
  const data = {
    usuario,
    bien,
    now: now(),
    jefe
  }
  const fileName = `${templates.INGRESO_BIEN_SALIDA}-${new Date().getTime()}.pdf`;
  await generateDocument(data, templates.INGRESO_BIEN_SALIDA, fileName);
  const { hashIpfs, linkIpfs } = await generateIpfs(fileName);
  return { hashIpfs, linkIpfs, fileName };
}

// generar documento levantamiento
const createDocumentLiftingGood = async(idProcess) => {
  const { idgoods, iduser } = await getAffectedGoodsAndUser(idProcess);
  const goods = await getBienDetails(idgoods);
  const items = []
  goods.map(async bienes => {
    const goodData = {
      placa: bienes.placa,
      sede: bienes.sede,
      dependencia: bienes.dependencia,
      espacio_fisico: bienes.espacio_fisico,
      descripcion: bienes.descripcion,
      marca_serie: bienes.marca_serie,
      estado_bien: bienes.estado_bien,
      responsable: bienes.responsable,
      verificacion: bienes.verificacion,
    };
    items.push(goodData);
  });
  const usuario = await getResponsibleUser(iduser)
  const data = {
    usuario,
    items,
    now: now(),
  }
  const fileName = `${templates.LEVANTAMIENTO}-${new Date().getTime()}.pdf`
  await generateDocument(data, templates.LEVANTAMIENTO, fileName);
  const { hashIpfs, linkIpfs } = await generateIpfs(fileName);
  return { hashIpfs, linkIpfs, fileName };
}

// generar documento traslado de bienes
const createTranslateGoods = async(idProcess) => {
  const { idgoods, iduser, fk_usuario_origen, fk_usuario_destino, fk_usuario_aprobador } = await getAffectedGoodsAndUser(idProcess);
  const goods = await getBienDetails(idgoods);
  const items = []
  goods.map(async bienes => {
    const goodData = {
      placa: bienes.placa,
      sede: bienes.sede,
      dependencia: bienes.dependencia,
      espacio_fisico: bienes.espacio_fisico,
      descripcion: bienes.descripcion,
      marca_serie: bienes.marca_serie,
      estado_bien: bienes.estado_bien,
      responsable: bienes.responsable,
      verificacion: bienes.verificacion,
    };
    items.push(goodData);
  });
  const usuarioOrigen = await getResponsibleUser(fk_usuario_origen);
  const usuarioDestino = await getResponsibleUser(fk_usuario_destino);
  const usuarioAprobador = await getResponsibleUser(fk_usuario_aprobador);
  const data = {
    usuarioOrigen,
    usuarioDestino,
    usuarioAprobador,
    items,
    now: now(),
  }
  const fileName = `${templates.TRASLADO_BIENES_INDIVIDUALES}-${new Date().getTime()}.pdf`
  await generateDocument(data, templates.TRASLADO_BIENES_INDIVIDUALES, fileName, true);
  const { hashIpfs, linkIpfs } = await generateIpfs(fileName);
  return { hashIpfs, linkIpfs, fileName };
}

const generateDocument = async(data, template, fileName, vertical = false) => {
  let width = '11.7in';
  let height = '8.27in';
  if (vertical) {
    width = '8.27in';
    height = '11.7in';
  }
  try {
    const browser = await pup.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const content = await compile(template, data);

    await page.setContent(content);
    await page.emulateMediaType('screen');
    await page.pdf({
      footerTemplate: "N/A",
      printBackground: true,
      width,
      height,
      margin: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm"
      },
      path: await path.join(__dirname + '../../documents/', fileName)
    });
    await browser.close();
    return true
  } catch (error) {
    console.log(error);
    return false
  }
}

const compile = async(template, data) => {
  try {
    const fPath = await path.join(__dirname + '../../public/', `${template}.html`);
    const html = await fs_x.readFile(fPath, 'utf-8');
    return hbs.compile(html)(data);
  } catch (error) {
    console.log(error)
  }
}

const now = (date) => {
  if (date) return new Date(date).toLocaleDateString();
  return new Date().toLocaleDateString();
}

// module.exports = {
//   createDocumentDropGood,
//   createDocumentEntryGood,
//   createDocumentDepartureGood,
//   createDocumentLiftingGood,

// }