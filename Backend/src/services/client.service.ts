import { AppDataSource } from "../config/data-source";
import { Client } from "../models/Client";
import { CreateClientDto, UpdateClientDto } from "../dto/client.dto";
import { validate } from "class-validator";
import { QueryRunner } from "typeorm";
import { 
  BadRequestError, 
  ConflictError, 
  NotFoundError 
} from "../utils/errors/httpError";
import { handleValidationErrors } from "../utils/apiResponse";

export class ClientService {
  private clientRepository = AppDataSource.getRepository(Client);

  async createClient(createClientDto: CreateClientDto) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validación con class-validator
      const errors = await validate(createClientDto);
      if (errors.length > 0) {
        throw new BadRequestError("Validation error", errors);
      }

      // Verificar si ya existe un cliente con el mismo nombre o contacto
      const existingClient = await this.clientRepository.findOne({
        where: [
          { name: createClientDto.name }, 
          { contact_info: createClientDto.contact_info }
        ],
      });

      if (existingClient) {
        throw new ConflictError("Ya existe un cliente con el mismo nombre o información de contacto.");
      }

      // Crear nuevo cliente
      const newClient = this.clientRepository.create({
        ...createClientDto,
        pais: createClientDto.pais || 'México',
        status: true
      });

      const savedClient = await this.clientRepository.save(newClient);
      await queryRunner.commitTransaction();

      return {
        ...savedClient,
        direccionCompleta: savedClient.getDireccionCompleta()
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getClients(page: number = 1, limit: number = 10, filters: any = {}) {
    try {
      const query = this.clientRepository.createQueryBuilder("client");

      // Aplicar filtros
      if (filters.name) query.andWhere("client.name ILIKE :name", { name: `%${filters.name}%` });
      if (filters.status !== undefined) {
        query.andWhere("client.status = :status", { status: filters.status === "true" });
      }
      if (filters.startDate && filters.endDate) {
        query.andWhere("client.created_at BETWEEN :startDate AND :endDate", {
          startDate: new Date(filters.startDate as string).toISOString(),
          endDate: new Date(filters.endDate as string).toISOString()
        });
      }
      if (filters.rfc) query.andWhere("client.rfc = :rfc", { rfc: filters.rfc });
      if (filters.codigoPostal) query.andWhere("client.codigoPostal = :codigoPostal", { codigoPostal: filters.codigoPostal });

      // Ejecutar consulta paginada
      const [clients, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy("client.name", "ASC")
        .getManyAndCount();

      return {
        data: clients.map(client => ({
          ...client,
          direccionCompleta: client.getDireccionCompleta()
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

  async getClientById(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestError("ID de cliente inválido");
    }

    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['remissions']
    });

    if (!client) {
      throw new NotFoundError("Cliente no encontrado.");
    }

    return {
      ...client,
      direccionCompleta: client.getDireccionCompleta(),
      remissions: client.remissions
    };
  }

  async updateClient(id: number, updateClientDto: UpdateClientDto) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!id || isNaN(id)) {
        throw new BadRequestError("ID de cliente inválido");
      }

      // Validación con class-validator
      const errors = await validate(updateClientDto);
      if (errors.length > 0) {
        throw new BadRequestError("Validation error", errors);
      }

      const clientRepository = queryRunner.manager.getRepository(Client);
      const client = await clientRepository.findOneBy({ id });

      if (!client) {
        throw new NotFoundError("El cliente no existe.");
      }

      // Actualizar campos permitidos
      Object.assign(client, updateClientDto);
      const updatedClient = await clientRepository.save(client);
      await queryRunner.commitTransaction();

      return {
        ...updatedClient,
        direccionCompleta: updatedClient.getDireccionCompleta()
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteClient(id: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!id || isNaN(id)) {
        throw new BadRequestError("ID de cliente inválido");
      }

      const clientRepository = queryRunner.manager.getRepository(Client);
      const client = await clientRepository.findOne({
        where: { id },
        relations: ['remissions']
      });

      if (!client) {
        throw new NotFoundError("El cliente no existe.");
      }

      // Verificar si tiene facturas generadas
      const tieneFacturas = client.remissions?.some(r => r.cfdiFolio !== null) ?? false;
      
      if (tieneFacturas) {
        throw new BadRequestError("No se puede eliminar, el cliente tiene facturas generadas.");
      }

      await clientRepository.remove(client);
      await queryRunner.commitTransaction();

      return { message: "Cliente eliminado exitosamente." };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async validateRfc(rfc: string) {
    if (!rfc) {
      throw new BadRequestError("RFC es requerido.");
    }

    // Patrón mejorado para validación de RFC
    const isValid = /^[A-ZÑ&]{3,4}\d{6}[A-V1-9][0-9A-Z]([0-9A])?$/i.test(rfc);
    return { valid: isValid };
  }
}