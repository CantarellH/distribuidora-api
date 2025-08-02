import { Request, Response } from "express";
import { EggTypeService } from "../services/eggType.service";
import { ApiResponse } from "../utils/apiResponse";
import { CreateEggTypeDto, UpdateEggTypeDto } from "../dto/egg-type.dto";
import { validate } from "class-validator";
import { handleValidationErrors } from "../utils/apiResponse";

export class EggTypeController {
  private eggTypeService: EggTypeService;

  constructor() {
    this.eggTypeService = new EggTypeService();
  }

  async getEggTypes(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const response = await this.eggTypeService.getEggTypes(
        Number(page),
        Number(limit)
      );
      ApiResponse.success(res, 200, "Tipos de huevo obtenidos exitosamente", response);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async createEggType(req: Request, res: Response) {
    try {
      const eggTypeDto = new CreateEggTypeDto();
      Object.assign(eggTypeDto, req.body);

      const errors = await validate(eggTypeDto);
      if (errors.length > 0) {
        const validationError = handleValidationErrors(errors);
        return ApiResponse.error(res, validationError);
      }

      const response = await this.eggTypeService.createEggType(eggTypeDto);
      ApiResponse.success(res, 201, "Tipo de huevo creado exitosamente", response);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async getSuppliersByEggType(req: Request, res: Response) {
    try {
      const { eggTypeId } = req.params;
      const response = await this.eggTypeService.getSuppliersByEggType(Number(eggTypeId));
      ApiResponse.success(res, 200, "Proveedores obtenidos exitosamente", response);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async getEggTypesBySupplier(req: Request, res: Response) {
    try {
      const { supplierId } = req.params;
      const response = await this.eggTypeService.getEggTypesBySupplier(Number(supplierId));
      ApiResponse.success(res, 200, "Tipos de huevo obtenidos exitosamente", response);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async updateEggType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const eggTypeDto = new UpdateEggTypeDto();
      Object.assign(eggTypeDto, req.body);

      const errors = await validate(eggTypeDto);
      if (errors.length > 0) {
        const validationError = handleValidationErrors(errors);
        return ApiResponse.error(res, validationError);
      }

      const response = await this.eggTypeService.updateEggType(Number(id), eggTypeDto);
      ApiResponse.success(res, 200, "Tipo de huevo actualizado exitosamente", response);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async deleteEggType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await this.eggTypeService.deleteEggType(Number(id));
      ApiResponse.success(res, 200, response.message);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}

// Exportamos una instancia del controlador
export const eggTypeController = new EggTypeController();