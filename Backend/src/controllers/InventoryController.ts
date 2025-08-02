import { Request, Response } from "express";
import { InventoryService } from "../services/inventory.service";
import { ApiResponse } from "../utils/apiResponse";
import { 
  CreateInventoryEntryDto, 
  UpdateInventoryEntryDto, 
  AdjustStockDto,
  InventoryMovementFilterDto
} from "../dto/inventory.dto";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";

export class InventoryController {
  private inventoryService = new InventoryService();

  async createEntry(req: Request, res: Response) {
    try {
      const dto = plainToInstance(CreateInventoryEntryDto, req.body);
      await validateOrReject(dto);
      
      const result = await this.inventoryService.createEntry(dto);
      ApiResponse.success(res, 201, "Entrada de inventario creada con éxito", result);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async getEntries(req: Request, res: Response) {
    try {
      const { supplierId, eggTypeId, startDate, endDate } = req.query;
      const parsedSupplierId = supplierId ? parseInt(supplierId as string) : undefined;
      const parsedEggTypeId = eggTypeId ? parseInt(eggTypeId as string) : undefined;
      
      const result = await this.inventoryService.getEntries(
        parsedSupplierId,
        parsedEggTypeId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      ApiResponse.success(res, 200, "Entradas obtenidas con éxito", result);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async getEntryById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.inventoryService.getEntryById(id);
      ApiResponse.success(res, 200, "Entrada obtenida con éxito", result);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async updateEntry(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const dto = plainToInstance(UpdateInventoryEntryDto, req.body);
      await validateOrReject(dto);
      
      const result = await this.inventoryService.updateEntry(id, dto);
      ApiResponse.success(res, 200, "Entrada actualizada con éxito", result);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async deleteEntry(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.inventoryService.deleteEntry(id);
      ApiResponse.success(res, 200, "Entrada eliminada con éxito", result);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async getCurrentStock(req: Request, res: Response) {
    try {
      const result = await this.inventoryService.getCurrentStock();
      ApiResponse.success(res, 200, "Stock actual obtenido con éxito", result);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async getStockByEggType(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.inventoryService.getStockByEggType(id);
      ApiResponse.success(res, 200, "Stock por tipo de huevo obtenido con éxito", result);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async adjustStock(req: Request, res: Response) {
    try {
      const dto = plainToInstance(AdjustStockDto, req.body);
      await validateOrReject(dto);
      
      const result = await this.inventoryService.adjustStock(dto);
      ApiResponse.success(res, 200, "Stock ajustado con éxito", result);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async getMovements(req: Request, res: Response) {
    try {
      const dto = plainToInstance(InventoryMovementFilterDto, req.query);
      await validateOrReject(dto);
      
      const result = await this.inventoryService.getMovements(dto);
      ApiResponse.success(res, 200, "Movimientos obtenidos con éxito", result);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}