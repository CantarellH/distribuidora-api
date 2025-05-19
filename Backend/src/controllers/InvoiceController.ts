import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Client } from "../models/Client";
import { Remission } from "../models/Remission";
import { RemissionDetail } from "../models/RemissionDetail";
import { EggType } from "../models/EggType";
import soap from "soap";
import { FacturacionError } from "../errors/FacturacionError";

export const generateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { remissionId } = req.params;

    // Obtener la remisión con todos sus datos relacionados
    const remissionRepository = AppDataSource.getRepository(Remission);
    const remission = await remissionRepository.findOne({
      where: { id: parseInt(remissionId, 10) },
      relations: [
        "client",
        "details",
        "details.eggType",
        "details.supplier",
        "paymentDetails",
        "paymentDetails.payment"
      ]
    });

    if (!remission) {
      res.status(404).json({ error: "Remisión no encontrada." });
      return;
    }

    // Verificar si ya está pagada
    if (!remission.isPaid) {
      res.status(400).json({ error: "La remisión no está completamente pagada." });
      return;
    }

    // Verificar si ya tiene CFDI generado
    if (remission.cfdiFolio) {
      res.status(400).json({ error: "Esta remisión ya tiene un CFDI generado." });
      return;
    }

    // Construir el documento TXT para el webservice
    const cfdiTxt = buildCfdiTxt(remission);

    // Configuración del webservice
    const wsdlUrl = "https://www.facturemosya.com/webservice/timbrarCfdi4_0.php?wsdl";
    const client = await soap.createClientAsync(wsdlUrl);

    // Parámetros para el webservice
    const params = {
      usuario: process.env.FACTUREMOSYA_USER || "democfdi",
      contra: process.env.FACTUREMOSYA_PASS || "demo2011",
      documento: cfdiTxt,
      consecutivo: 0 // 0 para folio no consecutivo
    };

    // Llamar al webservice
    const result = await client.RecibirTXTAsync(params);

    // Procesar la respuesta
    if (result[0].codigo !== "201") {
      throw new FacturacionError(result[0].descripcion, parseInt(result[0].codigo, 400));
    }

    // Extraer datos del timbre fiscal
    const timbreFiscal = result[0].timbrefiscal.split("|");
    const uuid = timbreFiscal[1];
    const fechaTimbrado = timbreFiscal[2];

    // Actualizar la remisión con los datos del CFDI
    remission.cfdiFolio = uuid;
    remission.cfdiFecha = new Date(fechaTimbrado);
    remission.cfdiXml = result[0].descripcion; // XML completo
    remission.cfdiPdf = result[0].documentopdf; // PDF en base64
    await remissionRepository.save(remission);

    res.status(200).json({
      message: "CFDI generado correctamente",
      uuid,
      fechaTimbrado,
      pdfBase64: result[0].documentopdf
    });
  } catch (error) {
    console.error("Error al generar CFDI:", error);
    
    if (error instanceof FacturacionError) {
      res.status(error.statusCode).json({ 
        error: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({ error: "Error interno del servidor al generar CFDI" });
    }
  }
};

// Función para construir el documento TXT en el formato requerido
function buildCfdiTxt(remission: Remission): string {
  const client = remission.client;
  const details = remission.details;
  
  // Línea COM (Comprobante)
  let cfdiTxt = `COM||version|4.0||folio|${remission.id}||fecha|${formatDate(new Date())}||FormaPago|99||subTotal|${remission.totalCost.toFixed(2)}||Moneda|MXN||total|${remission.totalCost.toFixed(2)}||tipoDeComprobante|I||Exportacion|01||MetodoPago|PPD\n`;

  // Línea EMI (Emisor) - Estos datos deberían venir de tu configuración global
  cfdiTxt += `EMI||Regimen|601\n`; // Régimen general de ley de personas morales

  // Línea REC (Receptor)
  cfdiTxt += `REC||rfc|${client.rfc || 'XAXX010101000'}||nombre|${client.name}||UsoCFDI|G03||RegimenFiscalReceptor|${getRegimenFiscalReceptor(client)}\n`;

  // Línea DOR (Domicilio del Receptor)
  cfdiTxt += `DOR||calle|${client.calle || 'SIN CALLE'}||noExterior|${client.numeroExterior || 'S/N'}||colonia|${client.colonia || 'SIN COLONIA'}||municipio|${client.alcaldiaMunicipio || 'SIN MUNICIPIO'}||estado|${client.estado || 'SIN ESTADO'}||pais|MEX||codigoPostal|${client.codigoPostal || '00000'}\n`;

  // Líneas CON (Conceptos)
  details.forEach(detail => {
    const eggType = detail.eggType;
    
    cfdiTxt += `CON||ClaveProdServ|${eggType.claveSat || '01010101'}||cantidad|${detail.boxCount.toFixed(2)}||ClaveUnidad|${eggType.claveUnidadSat || 'H87'}||unidad|${eggType.unidadSat || 'PIEZA'}||descripcion|${eggType.name}||valorUnitario|${(detail.pricePerKilo * detail.weightTotal / detail.boxCount).toFixed(2)}||importe|${(detail.pricePerKilo * detail.weightTotal).toFixed(2)}||ObjetoImp|02\n`;
    
    // Línea CONIT (Impuestos trasladados del concepto)
    cfdiTxt += `CONIT||Base|${(detail.pricePerKilo * detail.weightTotal).toFixed(2)}||Impuesto|002||TipoFactor|Tasa||TasaOCuota|0.16||Importe|${(detail.pricePerKilo * detail.weightTotal * 0.16).toFixed(2)}\n`;
  });

  // Línea TRA (Impuestos trasladados)
  const totalImpuestos = details.reduce((sum, detail) => sum + (detail.pricePerKilo * detail.weightTotal * 0.16), 0);
  cfdiTxt += `TRA||Base|${remission.totalCost.toFixed(2)}||Impuesto|002||TipoFactor|Tasa||TasaOCuota|0.16||Importe|${totalImpuestos.toFixed(2)}\n`;

  return cfdiTxt;
}

// Función auxiliar para formatear fecha en formato ISO 8601
function formatDate(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, '');
}

// Función para determinar el régimen fiscal del receptor
function getRegimenFiscalReceptor(client: Client): string {
  if (client.rfc === 'XAXX010101000' || client.rfc === 'XEXX010101000') {
    return '616'; // Régimen para extranjeros
  }
  return client.regimenFiscal || '601'; // Régimen general por defecto
}