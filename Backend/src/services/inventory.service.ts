import { AppDataSource } from "../config/data-source";
import { InventoryEntry } from "../models/InventoryEntry";
import { InventoryEntryDetail } from "../models/InventoryEntryDetail";
import { Supplier } from "../models/Supplier";
import { EggType } from "../models/EggType";
import { InventoryMovement, MovementType } from "../models/InventoryMovement";
import { CreateInventoryEntryDto, UpdateInventoryEntryDto, AdjustStockDto, InventoryMovementFilterDto } from "../dto/inventory.dto";
import { HttpError } from "../utils/httpError";
import { Between, In } from "typeorm";

export class InventoryService {
  private inventoryEntryRepository = AppDataSource.getRepository(InventoryEntry);
  private inventoryDetailRepository = AppDataSource.getRepository(InventoryEntryDetail);
  private supplierRepository = AppDataSource.getRepository(Supplier);
  private eggTypeRepository = AppDataSource.getRepository(EggType);
  private movementRepository = AppDataSource.getRepository(InventoryMovement);

  async createEntry(dto: CreateInventoryEntryDto) {
    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const supplier = await this.supplierRepository.findOneBy({ id: dto.supplierId });
      if (!supplier) throw new HttpError(404, "Proveedor no encontrado");

      const entry = this.inventoryEntryRepository.create({ supplier });
      await transactionalEntityManager.save(entry);

      for (const detail of dto.details) {
        const eggType = await this.eggTypeRepository.findOneBy({ id: detail.eggTypeId });
        if (!eggType) throw new HttpError(400, `Tipo de huevo con id ${detail.eggTypeId} no encontrado`);

        const newDetail = this.inventoryDetailRepository.create({
          inventoryEntry: entry,
          eggType,
          boxCount: detail.boxCount,
          weightTotal: detail.weightTotal,
        });

        await transactionalEntityManager.save(newDetail);

        eggType.currentStock += detail.boxCount;
        await transactionalEntityManager.save(eggType);

        const movement = this.movementRepository.create({
          eggType,
          movementType: MovementType.ENTRY,
          quantity: detail.boxCount,
          referenceId: entry.id,
          currentStock: eggType.currentStock,
          details: `Entrada de inventario desde proveedor ${supplier.name}`
        });
        await transactionalEntityManager.save(movement);
      }

      return entry;
    });
  }

  async getEntries(supplierId?: number, eggTypeId?: number, startDate?: Date, endDate?: Date) {
    const query = this.inventoryEntryRepository.createQueryBuilder("entry")
      .leftJoinAndSelect("entry.supplier", "supplier")
      .leftJoinAndSelect("entry.details", "details")
      .leftJoinAndSelect("details.eggType", "eggType");

    if (supplierId) query.andWhere("supplier.id = :supplierId", { supplierId });
    if (eggTypeId) query.andWhere("eggType.id = :eggTypeId", { eggTypeId });
    if (startDate && endDate) {
      query.andWhere("entry.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate });
    }

    return query.getMany();
  }

  async getEntryById(id: number) {
    const entry = await this.inventoryEntryRepository.findOne({
      where: { id },
      relations: ["supplier", "details", "details.eggType"],
    });
    if (!entry) throw new HttpError(404, "Entrada de inventario no encontrada");
    return entry;
  }

  async updateEntry(id: number, dto: UpdateInventoryEntryDto) {
    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const entry = await this.inventoryEntryRepository.findOne({
        where: { id },
        relations: ["details", "details.eggType"],
      });
      if (!entry) throw new HttpError(404, "Entrada de inventario no encontrada");

      // Revertir stock actual
      for (const oldDetail of entry.details) {
        const eggType = await this.eggTypeRepository.findOneBy({ id: oldDetail.eggType.id });
        if (eggType) {
          eggType.currentStock -= oldDetail.boxCount;
          await transactionalEntityManager.save(eggType);
        }
      }

      // Eliminar detalles antiguos
      await transactionalEntityManager.delete(InventoryEntryDetail, { inventoryEntry: entry });

      // Crear nuevos detalles
      for (const detail of dto.details) {
        const eggType = await this.eggTypeRepository.findOneBy({ id: detail.eggTypeId });
        if (!eggType) throw new HttpError(400, `Tipo de huevo con id ${detail.eggTypeId} no encontrado`);

        const newDetail = this.inventoryDetailRepository.create({
          inventoryEntry: entry,
          eggType,
          boxCount: detail.boxCount,
          weightTotal: detail.weightTotal,
        });

        await transactionalEntityManager.save(newDetail);

        eggType.currentStock += detail.boxCount;
        await transactionalEntityManager.save(eggType);

        const movement = this.movementRepository.create({
          eggType,
          movementType: MovementType.ADJUSTMENT,
          quantity: detail.boxCount,
          referenceId: entry.id,
          currentStock: eggType.currentStock,
          details: `Ajuste de inventario por actualización de entrada`
        });
        await transactionalEntityManager.save(movement);
      }

      return entry;
    });
  }

  async deleteEntry(id: number) {
    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const entry = await this.inventoryEntryRepository.findOne({
        where: { id },
        relations: ["details", "details.eggType"],
      });
      if (!entry) throw new HttpError(404, "Entrada de inventario no encontrada");

      for (const detail of entry.details) {
        const eggType = await this.eggTypeRepository.findOneBy({ id: detail.eggType.id });
        if (eggType) {
          eggType.currentStock -= detail.boxCount;
          await transactionalEntityManager.save(eggType);

          const movement = this.movementRepository.create({
            eggType,
            movementType: MovementType.ADJUSTMENT,
            quantity: -detail.boxCount,
            referenceId: entry.id,
            currentStock: eggType.currentStock,
            details: `Reversión de entrada de inventario eliminada`
          });
          await transactionalEntityManager.save(movement);
        }
      }

      await transactionalEntityManager.remove(entry);
      return entry;
    });
  }

  async getCurrentStock() {
    const eggTypes = await this.eggTypeRepository.find();
    return eggTypes.map(eggType => ({
      id: eggType.id,
      name: eggType.name,
      currentStock: eggType.currentStock,
      unit: 'cajas'
    }));
  }

  async getStockByEggType(id: number) {
    const eggType = await this.eggTypeRepository.findOneBy({ id });
    if (!eggType) throw new HttpError(404, "Tipo de huevo no encontrado");
    return {
      id: eggType.id,
      name: eggType.name,
      currentStock: eggType.currentStock,
      unit: 'cajas'
    };
  }

  async adjustStock(dto: AdjustStockDto) {
    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const eggType = await this.eggTypeRepository.findOneBy({ id: dto.eggTypeId });
      if (!eggType) throw new HttpError(404, "Tipo de huevo no encontrado");

      if (eggType.currentStock + dto.quantity < 0) {
        throw new HttpError(400, `No hay suficiente stock. Stock actual: ${eggType.currentStock}`);
      }

      const oldStock = eggType.currentStock;
      eggType.currentStock += dto.quantity;
      await transactionalEntityManager.save(eggType);

      const movement = this.movementRepository.create({
        eggType,
        movementType: dto.quantity > 0 ? MovementType.ADJUSTMENT_IN : MovementType.ADJUSTMENT_OUT,
        quantity: Math.abs(dto.quantity),
        currentStock: eggType.currentStock,
        details: `Ajuste manual: ${dto.reason}. Stock anterior: ${oldStock}`
      });
      await transactionalEntityManager.save(movement);

      return {
        eggTypeId: eggType.id,
        name: eggType.name,
        previousStock: oldStock,
        newStock: eggType.currentStock,
        adjustment: dto.quantity
      };
    });
  }

  async getMovements(filter: InventoryMovementFilterDto) {
    const where: any = {};
    if (filter.eggTypeId) where.eggType = { id: filter.eggTypeId };
    if (filter.movementType) where.movementType = filter.movementType;
    if (filter.startDate && filter.endDate) {
      where.createdAt = Between(new Date(filter.startDate), new Date(filter.endDate));
    }

    return this.movementRepository.find({
      where,
      relations: ["eggType"],
      order: { createdAt: "DESC" }
    });
  }
}