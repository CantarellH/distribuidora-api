import { Between } from "typeorm";
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Remission } from "../models/Remission";
import { RemissionDetail } from "../models/RemissionDetail";
import { RemissionWeightDetail } from "../models/RemissionWeightDetail";
import { EggType } from "../models/EggType";
import { Supplier } from "../models/Supplier";

export const createRemission = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, details, date  } = req.body;

        const remission = new Remission();
        remission.client = { id: clientId } as any; // Cliente con solo ID
        remission.date = date || new Date();

        remission.details = details.map((detail: any) => {
            const remissionDetail = new RemissionDetail();
            remissionDetail.eggType = { id: detail.eggTypeId } as any;
            remissionDetail.supplier = { id: detail.supplierId } as any;
            remissionDetail.boxCount = detail.boxCount;

            remissionDetail.weightTotal = detail.weights.map((weight: any) => {
                const weightDetail = new RemissionWeightDetail();
                weightDetail.weight = weight.value;
                weightDetail.byBox = weight.byBox;
                return weightDetail;
            });

            return remissionDetail;
        });

        await AppDataSource.getRepository(Remission).save(remission);
        res.status(201).json(remission);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getRemissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const remissionRepository = AppDataSource.getRepository(Remission);
  
      const remissions = await remissionRepository.find({
        relations: ["client", "details", "details.eggType", "payments"],
      });
  
      res.status(200).json(remissions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  };
  

export const getRemissionById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    // Validar el ID parseado
    if (isNaN(parsedId)) {
        console.error("ID inválido recibido:", id);
        res.status(400).json({ error: "ID inválido proporcionado." });
        return;
    }

    try {
        const remissionRepo = AppDataSource.getRepository(Remission);
        const remission = await remissionRepo.findOne({
            where: { id: parsedId },
            relations: ["client", "details", "details.eggType", "details.supplier", "details.weightDetails"],
        });

        if (!remission) {
            res.status(404).json({ error: "Remisión no encontrada." });
            return;
        }

        res.json(remission);
    } catch (error) {
        console.error("Error al obtener la remisión por ID:", error);
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateRemission = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { date, details } = req.body;

    try {
        const remissionRepo = AppDataSource.getRepository(Remission);
        const remission = await remissionRepo.findOneBy({ id: parseInt(id, 10) });

        if (!remission) {
            res.status(404).json({ error: "Remisión no encontrada." });
            return;
        }

        remission.date = date || remission.date;
        await remissionRepo.save(remission); // Aquí solo se guarda si no es null

        // Actualizar detalles...
        res.json({ message: "Remisión actualizada exitosamente.", remission });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const deleteRemission = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const remissionRepo = AppDataSource.getRepository(Remission);
        const remission = await remissionRepo.findOneBy({ id: parseInt(id, 10) });

        if (!remission) {
            res.status(404).json({ error: "Remisión no encontrada." });
            return;
        }

        await remissionRepo.remove(remission); // Aquí solo se elimina si no es null
        res.json({ message: "Remisión eliminada exitosamente." });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const filterRemissions = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extraer y sanitizar los parámetros de la consulta
        const { startDate, endDate, clientId, status } = req.query;

        console.log("Parámetros recibidos:", { startDate, endDate, clientId, status });

        // Crear el query builder
        const remissionRepo = AppDataSource.getRepository(Remission);
        const query = remissionRepo.createQueryBuilder("remission")
            .leftJoinAndSelect("remission.client", "client")
            .leftJoinAndSelect("remission.details", "details")
            .leftJoinAndSelect("details.eggType", "eggType")
            .leftJoinAndSelect("details.supplier", "supplier")
            .leftJoinAndSelect("details.weightDetails", "weightDetails");

        // Validar y manejar filtros de fechas
        if (startDate || endDate) {
            if (!startDate || !endDate) {
                console.error("Ambas fechas deben proporcionarse juntas.");
                res.status(400).json({ error: "Debe proporcionar ambas fechas (startDate y endDate)." });
                return;
            }

            const parsedStartDate = new Date(startDate as string);
            const parsedEndDate = new Date(endDate as string);

            if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                console.error("Fechas inválidas recibidas:", { startDate, endDate });
                res.status(400).json({ error: "Fechas inválidas proporcionadas." });
                return;
            }

            query.andWhere("remission.date BETWEEN :startDate AND :endDate", {
                startDate: parsedStartDate.toISOString(),
                endDate: parsedEndDate.toISOString(),
            });
        }

        // Validar y manejar filtro de clientId
        if (clientId !== undefined && clientId !== null && clientId.toString().trim() !== "") {
            const parsedClientId = parseInt(clientId as string, 10);

            if (isNaN(parsedClientId)) {
                console.error("Client ID inválido recibido:", clientId);
                res.status(400).json({ error: "El clientId debe ser un número válido." });
                return;
            }

            query.andWhere("remission.clientId = :clientId", { clientId: parsedClientId });
        }

        // Validar y manejar filtro de status
        if (status && status.toString().trim() !== "") {
            query.andWhere("remission.status = :status", { status });
        }

        // Logs para depuración
        console.log("Consulta SQL generada:", query.getSql());
        console.log("Parámetros utilizados:", query.getParameters());

        // Ejecutar consulta
        const remissions = await query.getMany();
        res.json(remissions);
    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).json({ error: (error as Error).message });
    }
};
