import { AppDataSource } from "../config/data-source";
import { EggType } from "../models/EggType";
import { Supplier } from "../models/Supplier";
import { EggTypeSupplier } from "../models/EggTypeSupplier";
import { CreateEggTypeDto, UpdateEggTypeDto } from "../dto/egg-type.dto";
import { validate } from "class-validator";
import { QueryRunner } from "typeorm";
import { 
  BadRequestError, 
  NotFoundError,
  ConflictError
} from "../utils/errors/httpError";
import { PaginatedResponse, EggTypeResponse } from "../interfaces/responses";

export class EggTypeService {
  private eggTypeRepository = AppDataSource.getRepository(EggType);
  private supplierRepository = AppDataSource.getRepository(Supplier);
  private eggTypeSupplierRepository = AppDataSource.getRepository(EggTypeSupplier);

  async getEggTypes(page: number = 1, limit: number = 10): Promise<PaginatedResponse<EggTypeResponse>> {
    try {
      const [eggTypes, total] = await this.eggTypeRepository.findAndCount({
        relations: ["eggTypeSuppliers.supplier"],
        skip: (page - 1) * limit,
        take: limit,
        order: { id: "ASC" },
      });

      return {
        data: eggTypes.map(eggType => ({
          id: eggType.id,
          name: eggType.name,
          description: eggType.description,
          claveSat: eggType.claveSat,
          unidadSat: eggType.unidadSat,
          claveUnidadSat: eggType.claveUnidadSat,
          createdAt: eggType.createdAt,
          updatedAt: eggType.updatedAt,
          suppliers: eggType.eggTypeSuppliers?.map(ets => ets.supplier) || [],
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async createEggType(createEggTypeDto: CreateEggTypeDto): Promise<EggTypeResponse> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const errors = await validate(createEggTypeDto);
      if (errors.length > 0) {
        throw new BadRequestError("Validation error", errors);
      }

      const { supplierId, ...eggTypeData } = createEggTypeDto;
      const eggTypeRepository = queryRunner.manager.getRepository(EggType);
      const supplierRepository = queryRunner.manager.getRepository(Supplier);
      const eggTypeSupplierRepository = queryRunner.manager.getRepository(EggTypeSupplier);

      // Verificar si el tipo de huevo ya existe
      const existingEggType = await eggTypeRepository.findOne({ 
        where: { name: eggTypeData.name } 
      });
      
      if (existingEggType) {
        throw new ConflictError("Ya existe un tipo de huevo con este nombre");
      }

      const newEggType = eggTypeRepository.create(eggTypeData);
      await eggTypeRepository.save(newEggType);

      if (supplierId) {
        const supplier = await supplierRepository.findOneBy({ id: supplierId });
        if (!supplier) {
          throw new NotFoundError("Proveedor no encontrado");
        }

        const newEggTypeSupplier = eggTypeSupplierRepository.create({
          eggType: newEggType,
          supplier,
        });
        await eggTypeSupplierRepository.save(newEggTypeSupplier);
      }

      const eggTypeWithSuppliers = await eggTypeRepository.findOne({
        where: { id: newEggType.id },
        relations: ["eggTypeSuppliers", "eggTypeSuppliers.supplier"],
      });

      if (!eggTypeWithSuppliers) {
        throw new Error("No se encontró el tipo de huevo con proveedores");
      }

      await queryRunner.commitTransaction();

      return {
        ...eggTypeWithSuppliers,
        suppliers: eggTypeWithSuppliers.eggTypeSuppliers.map(ets => ets.supplier),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getSuppliersByEggType(eggTypeId: number): Promise<Supplier[]> {
    if (!eggTypeId || isNaN(eggTypeId)) {
      throw new BadRequestError("ID de tipo de huevo inválido");
    }

    const eggTypeSuppliers = await this.eggTypeSupplierRepository.find({
      where: { eggType: { id: eggTypeId } },
      relations: ["supplier"],
    });

    return eggTypeSuppliers.map(ets => ets.supplier);
  }

  async getEggTypesBySupplier(supplierId: number): Promise<EggType[]> {
    if (!supplierId || isNaN(supplierId)) {
      throw new BadRequestError("ID de proveedor inválido");
    }

    const eggTypeSuppliers = await this.eggTypeSupplierRepository.find({
      where: { supplier: { id: supplierId } },
      relations: ["eggType"],
    });

    return eggTypeSuppliers.map(ets => ets.eggType);
  }

  async updateEggType(id: number, updateEggTypeDto: UpdateEggTypeDto): Promise<EggTypeResponse> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!id || isNaN(id)) {
        throw new BadRequestError("ID de tipo de huevo inválido");
      }

      const errors = await validate(updateEggTypeDto);
      if (errors.length > 0) {
        throw new BadRequestError("Validation error", errors);
      }

      const { supplierId, ...updateData } = updateEggTypeDto;
      const eggTypeRepository = queryRunner.manager.getRepository(EggType);
      const supplierRepository = queryRunner.manager.getRepository(Supplier);
      const eggTypeSupplierRepository = queryRunner.manager.getRepository(EggTypeSupplier);

      const eggType = await eggTypeRepository.findOne({
        where: { id },
        relations: ["eggTypeSuppliers"],
      });

      if (!eggType) {
        throw new NotFoundError("Tipo de huevo no encontrado");
      }

      Object.assign(eggType, updateData);
      await eggTypeRepository.save(eggType);

      if (supplierId !== undefined) {
        await eggTypeSupplierRepository.delete({ eggType: { id } });

        if (supplierId) {
          const supplier = await supplierRepository.findOneBy({ id: supplierId });
          if (!supplier) {
            throw new NotFoundError("Proveedor no encontrado");
          }

          const newEggTypeSupplier = eggTypeSupplierRepository.create({
            eggType,
            supplier,
          });
          await eggTypeSupplierRepository.save(newEggTypeSupplier);
        }
      }

      await queryRunner.commitTransaction();

      const updatedEggType = await eggTypeRepository.findOne({
        where: { id },
        relations: ["eggTypeSuppliers.supplier"],
      });

      if (!updatedEggType) {
        throw new Error("No se pudo recuperar el tipo de huevo actualizado");
      }

      return {
        ...updatedEggType,
        suppliers: updatedEggType.eggTypeSuppliers.map(ets => ets.supplier),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteEggType(id: number): Promise<{ message: string }> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!id || isNaN(id)) {
        throw new BadRequestError("ID de tipo de huevo inválido");
      }

      const eggTypeRepository = queryRunner.manager.getRepository(EggType);
      const eggTypeSupplierRepository = queryRunner.manager.getRepository(EggTypeSupplier);

      // Primero eliminamos las relaciones
      await eggTypeSupplierRepository.delete({ eggType: { id } });

      // Luego eliminamos el tipo de huevo
      const result = await eggTypeRepository.delete({ id });

      if (result.affected === 0) {
        throw new NotFoundError("Tipo de huevo no encontrado");
      }

      await queryRunner.commitTransaction();
      return { message: "Tipo de huevo eliminado correctamente" };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}