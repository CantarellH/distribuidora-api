import { Request, Response } from "express";
import { ClientService } from "../services/client.service";
import { ApiResponse } from "../utils/apiResponse";
import { CreateClientDto, UpdateClientDto } from "../dto/client.dto";
import { validate } from "class-validator";
import { handleValidationErrors } from "../utils/apiResponse";

export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  async createClient(req: Request, res: Response) {
    try {
      const clientDto = new CreateClientDto();
      Object.assign(clientDto, req.body);

      const errors = await validate(clientDto);
      if (errors.length > 0) {
        const validationError = handleValidationErrors(errors);
        return ApiResponse.error(res, validationError);
      }

      const response = await this.clientService.createClient(clientDto);
      ApiResponse.success(res, 201, "Cliente creado exitosamente", response);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async getClients(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const response = await this.clientService.getClients(
        Number(page),
        Number(limit),
        filters
      );
      ApiResponse.success(res, 200, "Clientes obtenidos exitosamente", response);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async getClientById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await this.clientService.getClientById(Number(id));
      ApiResponse.success(res, 200, "Cliente obtenido exitosamente", response);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async updateClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clientDto = new UpdateClientDto();
      Object.assign(clientDto, req.body);

      const errors = await validate(clientDto);
      if (errors.length > 0) {
        const validationError = handleValidationErrors(errors);
        return ApiResponse.error(res, validationError);
      }

      const response = await this.clientService.updateClient(Number(id), clientDto);
      ApiResponse.success(res, 200, "Cliente actualizado exitosamente", response);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async deleteClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await this.clientService.deleteClient(Number(id));
      ApiResponse.success(res, 200, response.message);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async validateRfc(req: Request, res: Response) {
    try {
      const { rfc } = req.body;
      const response = await this.clientService.validateRfc(rfc);
      ApiResponse.success(res, 200, "RFC validado", response);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}

// Exportamos una instancia del controlador
export const clientController = new ClientController();