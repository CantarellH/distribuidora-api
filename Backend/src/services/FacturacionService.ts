import { AppDataSource } from "../config/data-source";
import { Remission } from "../models/Remission";
import axios from "axios";
import { FacturacionError } from "../errors/FacturacionError"; // Crearemos este tipo de error
import { Client } from "../models/Client";

export class FacturacionService {
  private static readonly API_URL =
    "https://webservice.facturemosya.com/api/v2";
  private static readonly TIMEOUT = 15000;

  async generarFactura(remissionId: number): Promise<FacturacionResponse> {
    const remission = await this.validarRemision(remissionId);
    const payload = this.crearPayloadFactura(remission);

    try {
      const response = await axios.post<FacturacionResponse>(
        `${FacturacionService.API_URL}/cfdi`,
        payload,
        {
          headers: this.getHeaders(),
          timeout: FacturacionService.TIMEOUT,
        }
      );

      await this.actualizarRemisionFacturada(remission, response.data);
      return response.data;
    } catch (error) {
      throw this.handleFacturacionError(error);
    }
  }

  private async validarRemision(remissionId: number): Promise<Remission> {
    const remissionRepo = AppDataSource.getRepository(Remission);
    const remission = await remissionRepo.findOne({
      where: { id: remissionId },
      relations: ["client", "details", "details.eggType"],
    });

    if (!remission) {
      throw new FacturacionError("Remisión no encontrada", 404);
    }

    if (remission.cfdiFolio) {
      throw new FacturacionError("La remisión ya fue facturada", 400);
    }

    this.validarCliente(remission.client);
    return remission;
  }

  private validarCliente(client: Client): void {
    const camposRequeridos = [
      { campo: client.rfc, mensaje: "El cliente no tiene RFC registrado" },
      {
        campo: client.regimenFiscal,
        mensaje: "Regimen fiscal no especificado",
      },
      { campo: client.calle, mensaje: "Dirección incompleta: calle faltante" },
      { campo: client.codigoPostal, mensaje: "Código postal faltante" },
    ];

    camposRequeridos.forEach(({ campo, mensaje }) => {
      if (!campo) throw new FacturacionError(mensaje, 400);
    });
  }

  private crearPayloadFactura(remission: Remission): FacturacionPayload {
    return {
      Receptor: {
        Rfc: remission.client.rfc!,
        Nombre: remission.client.name,
        RegimenFiscal: remission.client.regimenFiscal!,
        Domicilio: this.crearDomicilio(remission.client),
      },
      Conceptos: remission.details.map((detalle) => ({
        ClaveProdServ: "01010101",
        NoIdentificacion: detalle.eggType.sku || `HUEVO-${detalle.eggType.id}`,
        Cantidad: detalle.boxCount,
        ClaveUnidad: "H87",
        Unidad: "Pieza",
        Descripcion: `Huevo ${detalle.eggType.name}`,
        ValorUnitario: detalle.pricePerKilo,
        Importe: detalle.weightTotal * detalle.pricePerKilo,
      })),
      Fecha: new Date().toISOString(),
      Moneda: "MXN",
      TipoDeComprobante: "I",
      MetodoPago: "PUE",
      FormaPago: "01",
    };
  }

  private crearDomicilio(client: Client): DomicilioFiscal {
    return {
      Calle: client.calle!,
      NumeroExterior: client.numeroExterior || "S/N",
      NumeroInterior: client.numeroInterior || "",
      Colonia: client.colonia!,
      CodigoPostal: client.codigoPostal!,
      Municipio: client.alcaldiaMunicipio!,
      Estado: client.estado!,
      Pais: client.pais || "México",
    };
  }

  private async actualizarRemisionFacturada(
    remission: Remission,
    factura: FacturacionResponse
  ): Promise<void> {
    const remissionRepo = AppDataSource.getRepository(Remission);
    remission.cfdiFolio = factura.folioFiscal;
    remission.fechaFacturacion = new Date();
    await remissionRepo.save(remission);
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${process.env.FACTUREMOS_YA_API_KEY}`,
      "Content-Type": "application/json",
      "X-Api-Version": "2.0",
    };
  }

  private handleFacturacionError(error: any): FacturacionError {
    // Versión alternativa para versiones más antiguas de axios
    if ((error as any).isAxiosError) {
      const message =
        error.response?.data?.message ||
        "Error al comunicarse con FacturemosYa";
      return new FacturacionError(message, 502);
    }
    return error instanceof FacturacionError
      ? error
      : new FacturacionError("Error inesperado", 500);
  }
}

// Tipos auxiliares
interface FacturacionPayload {
  Receptor: {
    Rfc: string;
    Nombre: string;
    RegimenFiscal: string;
    Domicilio: DomicilioFiscal;
  };
  Conceptos: Array<{
    ClaveProdServ: string;
    NoIdentificacion: string;
    Cantidad: number;
    ClaveUnidad: string;
    Unidad: string;
    Descripcion: string;
    ValorUnitario: number;
    Importe: number;
  }>;
  Fecha: string;
  Moneda: string;
  TipoDeComprobante: string;
  MetodoPago: string;
  FormaPago: string;
}

interface DomicilioFiscal {
  Calle: string;
  NumeroExterior: string;
  NumeroInterior: string;
  Colonia: string;
  CodigoPostal: string;
  Municipio: string;
  Estado: string;
  Pais: string;
}

export interface FacturacionResponse {
  folioFiscal: string;
  xml: string;
  pdf: string;
  fechaTimbrado: string;
}
