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
exports.deleteClient = exports.updateClient = exports.getClientById = exports.getClients = exports.createClient = void 0;
const data_source_1 = require("../config/data-source");
const Client_1 = require("../models/Client");
const createClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, contact_info } = req.body;
        if (!name || !contact_info) {
            res
                .status(400)
                .json({
                error: "El nombre y la información de contacto son obligatorios.",
            });
            return;
        }
        const clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
        const existingClient = yield clientRepository.findOne({
            where: [{ name }, { contact_info }],
        });
        if (existingClient) {
            res.status(400).json({
                error: "Ya existe un cliente con el mismo nombre o información de contacto.",
            });
            return;
        }
        const newClient = clientRepository.create({
            name,
            contact_info,
            status: true,
        });
        const savedClient = yield clientRepository.save(newClient);
        res.status(201).json(savedClient);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.createClient = createClient;
const getClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, status, startDate, endDate } = req.query;
        const clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
        // Crear consulta básica
        const query = clientRepository.createQueryBuilder("client");
        // Filtro por nombre (búsqueda parcial con ILIKE para insensibilidad de mayúsculas)
        if (name) {
            query.andWhere("client.name ILIKE :name", { name: `%${name}%` });
        }
        // Filtro por estado
        if (status !== undefined) {
            const statusBoolean = status === "true";
            query.andWhere("client.status = :status", { status: statusBoolean });
        }
        // Filtro por rango de fechas de creación
        if (startDate && endDate) {
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);
            if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                res.status(400).json({ error: "Fechas inválidas." });
                return;
            }
            query.andWhere("client.created_at BETWEEN :startDate AND :endDate", {
                startDate: parsedStartDate.toISOString(),
                endDate: parsedEndDate.toISOString(),
            });
        }
        // Ejecutar consulta
        const clients = yield query.getMany();
        res.status(200).json(clients);
    }
    catch (error) {
        console.error("Error en la búsqueda de clientes:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getClients = getClients;
const getClientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
        const client = yield clientRepository.findOne({
            where: { id: parseInt(id, 10), status: true },
        });
        if (!client) {
            res.status(404).json({ error: "Cliente no encontrado." });
        }
        res.status(200).json(client);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getClientById = getClientById;
const updateClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
    try {
        const client = yield clientRepository.findOneBy({ id: parseInt(id, 10) });
        if (!client) {
            res.status(404).json({ error: "El cliente no existe." });
            return; // Detener la ejecución si no se encuentra el cliente
        }
        // Actualizar los campos del cliente
        client.name = (_a = req.body.name) !== null && _a !== void 0 ? _a : client.name;
        client.contact_info = (_b = req.body.contact_info) !== null && _b !== void 0 ? _b : client.contact_info;
        const updatedClient = yield clientRepository.save(client);
        res.status(200).json(updatedClient);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el cliente." });
    }
});
exports.updateClient = updateClient;
const deleteClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
    try {
        const client = yield clientRepository.findOneBy({ id: parseInt(id, 10) });
        if (!client) {
            res.status(404).json({ error: "El cliente no existe." });
            return;
        }
        yield clientRepository.remove(client);
        res.status(200).json({ message: "Cliente eliminado exitosamente." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar el cliente." });
    }
});
exports.deleteClient = deleteClient;
