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
exports.deleteInventoryEntry = exports.updateInventoryEntry = exports.getInventoryEntryById = exports.getInventoryEntries = exports.createInventoryEntry = void 0;
const data_source_1 = require("../config/data-source");
const InventoryEntry_1 = require("../models/InventoryEntry");
const InventoryEntryDetail_1 = require("../models/InventoryEntryDetail");
const Supplier_1 = require("../models/Supplier");
const EggType_1 = require("../models/EggType");
const createInventoryEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierId, details } = req.body;
        if (!supplierId || !Array.isArray(details)) {
            res
                .status(400)
                .json({ error: "Se requiere supplierId y un array de detalles." });
            return;
        }
        const supplierRepository = data_source_1.AppDataSource.getRepository(Supplier_1.Supplier);
        const eggTypeRepository = data_source_1.AppDataSource.getRepository(EggType_1.EggType);
        const supplier = yield supplierRepository.findOne({
            where: { id: supplierId },
        });
        if (!supplier) {
            res.status(404).json({ error: "Proveedor no encontrado." });
            return;
        }
        const inventoryRepository = data_source_1.AppDataSource.getRepository(InventoryEntry_1.InventoryEntry);
        const detailRepository = data_source_1.AppDataSource.getRepository(InventoryEntryDetail_1.InventoryEntryDetail);
        // Crear entrada de inventario
        const newEntry = inventoryRepository.create({ supplier });
        yield inventoryRepository.save(newEntry);
        // Validar y registrar detalles
        for (const detail of details) {
            const { eggTypeId, boxCount, weightTotal } = detail;
            const eggType = yield eggTypeRepository.findOne({
                where: { id: eggTypeId },
            });
            if (!eggType) {
                res
                    .status(400)
                    .json({ error: `Tipo de huevo con id ${eggTypeId} no encontrado.` });
                return;
            }
            const newDetail = detailRepository.create({
                inventoryEntry: newEntry,
                eggType,
                boxCount,
                weightTotal,
            });
            yield detailRepository.save(newDetail);
        }
        res
            .status(201)
            .json({ message: "Entrada de inventario creada con éxito." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.createInventoryEntry = createInventoryEntry;
const getInventoryEntries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventoryEntryRepository = data_source_1.AppDataSource.getRepository(InventoryEntry_1.InventoryEntry);
        const entries = yield inventoryEntryRepository.find({
            relations: ["supplier", "details", "details.eggType"],
        });
        res.status(200).json(entries);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getInventoryEntries = getInventoryEntries;
const getInventoryEntryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const inventoryEntryRepository = data_source_1.AppDataSource.getRepository(InventoryEntry_1.InventoryEntry);
        const entry = yield inventoryEntryRepository.findOne({
            where: { id: parseInt(id, 10) },
            relations: ["supplier", "details", "details.eggType"],
        });
        if (!entry) {
            res.status(404).json({ error: "Entrada de inventario no encontrada." });
            return;
        }
        res.status(200).json(entry);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getInventoryEntryById = getInventoryEntryById;
const updateInventoryEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { entryDetails } = req.body;
        if (!entryDetails || !Array.isArray(entryDetails)) {
            res
                .status(400)
                .json({
                error: "Los detalles son obligatorios para actualizar la entrada.",
            });
            return;
        }
        // Actualiza la entrada en la base de datos
        const inventoryRepository = data_source_1.AppDataSource.getRepository(InventoryEntry_1.InventoryEntry);
        const inventoryDetailRepository = data_source_1.AppDataSource.getRepository(InventoryEntryDetail_1.InventoryEntryDetail);
        const inventoryEntry = yield inventoryRepository.findOne({
            where: { id: Number(id) },
        });
        if (!inventoryEntry) {
            res.status(404).json({ error: "Entrada de inventario no encontrada." });
            return;
        }
        // Elimina los detalles antiguos y agrega los nuevos
        yield inventoryDetailRepository.delete({ inventoryEntry });
        const newDetails = entryDetails.map((detail) => inventoryDetailRepository.create({
            inventoryEntry,
            eggType: { id: detail.eggTypeId },
            boxCount: detail.boxCount,
            weightTotal: detail.weightTotal,
        }));
        yield inventoryDetailRepository.save(newDetails);
        res
            .status(200)
            .json({ message: "Entrada de inventario actualizada correctamente." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.updateInventoryEntry = updateInventoryEntry;
const deleteInventoryEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const inventoryEntryRepository = data_source_1.AppDataSource.getRepository(InventoryEntry_1.InventoryEntry);
        const entry = yield inventoryEntryRepository.findOne({
            where: { id: parseInt(id, 10) },
        });
        if (!entry) {
            res.status(404).json({ error: "Entrada de inventario no encontrada." });
            return;
        }
        yield inventoryEntryRepository.remove(entry);
        res
            .status(200)
            .json({ message: "Entrada de inventario eliminada con éxito." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.deleteInventoryEntry = deleteInventoryEntry;
