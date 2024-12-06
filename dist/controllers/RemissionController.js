"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterRemissions = exports.deleteRemission = exports.updateRemission = exports.getRemissionById = exports.getRemissions = exports.createRemission = void 0;
const data_source_1 = require("../config/data-source");
const Remission_1 = require("../models/Remission");
const RemissionDetail_1 = require("../models/RemissionDetail");
const RemissionWeightDetail_1 = require("../models/RemissionWeightDetail");
const createRemission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId, details, date } = req.body;
        const remission = new Remission_1.Remission();
        remission.client = { id: clientId }; // Cliente con solo ID
        remission.date = date || new Date();
        remission.details = details.map((detail) => {
            const remissionDetail = new RemissionDetail_1.RemissionDetail();
            remissionDetail.eggType = { id: detail.eggTypeId };
            remissionDetail.supplier = { id: detail.supplierId };
            remissionDetail.boxCount = detail.boxCount;
            remissionDetail.weightDetails = detail.weights.map((weight) => {
                const weightDetail = new RemissionWeightDetail_1.RemissionWeightDetail();
                weightDetail.weight = weight.value;
                weightDetail.byBox = weight.byBox;
                return weightDetail;
            });
            return remissionDetail;
        });
        yield data_source_1.AppDataSource.getRepository(Remission_1.Remission).save(remission);
        res.status(201).json(remission);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createRemission = createRemission;
const getRemissions = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const remissionRepo = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const remissions = yield remissionRepo.find({
            relations: ["client", "details", "details.eggType", "details.supplier", "details.weightDetails"],
        });
        res.json(remissions);
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
    }
});
exports.getRemissions = getRemissions;
const getRemissionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    // Validar el ID parseado
    if (isNaN(parsedId)) {
        console.error("ID inválido recibido:", id);
        res.status(400).json({ error: "ID inválido proporcionado." });
        return;
    }
    try {
        const remissionRepo = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const remission = yield remissionRepo.findOne({
            where: { id: parsedId },
            relations: ["client", "details", "details.eggType", "details.supplier", "details.weightDetails"],
        });
        if (!remission) {
            res.status(404).json({ error: "Remisión no encontrada." });
            return;
        }
        res.json(remission);
    }
    catch (error) {
        console.error("Error al obtener la remisión por ID:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.getRemissionById = getRemissionById;
const updateRemission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { date, details } = req.body;
    try {
        const remissionRepo = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const remission = yield remissionRepo.findOneBy({ id: parseInt(id, 10) });
        if (!remission) {
            res.status(404).json({ error: "Remisión no encontrada." });
            return;
        }
        remission.date = date || remission.date;
        yield remissionRepo.save(remission); // Aquí solo se guarda si no es null
        // Actualizar detalles...
        res.json({ message: "Remisión actualizada exitosamente.", remission });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateRemission = updateRemission;
const deleteRemission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const remissionRepo = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const remission = yield remissionRepo.findOneBy({ id: parseInt(id, 10) });
        if (!remission) {
            res.status(404).json({ error: "Remisión no encontrada." });
            return;
        }
        yield remissionRepo.remove(remission); // Aquí solo se elimina si no es null
        res.json({ message: "Remisión eliminada exitosamente." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteRemission = deleteRemission;
const filterRemissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extraer y sanitizar los parámetros de la consulta
        const { startDate, endDate, clientId, status } = req.query;
        console.log("Parámetros recibidos:", { startDate, endDate, clientId, status });
        // Crear el query builder
        const remissionRepo = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
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
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);
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
            const parsedClientId = parseInt(clientId, 10);
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
        const remissions = yield query.getMany();
        res.json(remissions);
    }
    catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.filterRemissions = filterRemissions;
