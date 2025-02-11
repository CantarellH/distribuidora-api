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
exports.getSuppliersByEggType = exports.getEggTypesBySupplier = exports.linkEggTypeToSupplier = void 0;
const data_source_1 = require("../config/data-source");
const EggTypeSupplier_1 = require("../models/EggTypeSupplier");
const EggType_1 = require("../models/EggType");
const Supplier_1 = require("../models/Supplier");
const linkEggTypeToSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eggTypeId, supplierId } = req.body;
        if (!eggTypeId || !supplierId) {
            return res.status(400).json({ error: "Se requieren eggTypeId y supplierId." });
        }
        const eggTypeRepository = data_source_1.AppDataSource.getRepository(EggType_1.EggType);
        const supplierRepository = data_source_1.AppDataSource.getRepository(Supplier_1.Supplier);
        const eggTypeSupplierRepository = data_source_1.AppDataSource.getRepository(EggTypeSupplier_1.EggTypeSupplier);
        const eggType = yield eggTypeRepository.findOneBy({ id: eggTypeId });
        const supplier = yield supplierRepository.findOneBy({ id: supplierId });
        if (!eggType || !supplier) {
            return res.status(404).json({ error: "Tipo de huevo o proveedor no encontrado." });
        }
        const newLink = eggTypeSupplierRepository.create({ eggType, supplier });
        yield eggTypeSupplierRepository.save(newLink);
        res.status(201).json(newLink);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al asociar tipo de huevo con proveedor." });
    }
});
exports.linkEggTypeToSupplier = linkEggTypeToSupplier;
const getEggTypesBySupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierId } = req.params;
        const eggTypeSupplierRepository = data_source_1.AppDataSource.getRepository(EggTypeSupplier_1.EggTypeSupplier);
        const eggTypes = yield eggTypeSupplierRepository.find({
            where: { supplier: { id: parseInt(supplierId, 10) } },
            relations: ["eggType"],
        });
        res.status(200).json(eggTypes.map((et) => et.eggType));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener tipos de huevo por proveedor." });
    }
});
exports.getEggTypesBySupplier = getEggTypesBySupplier;
const getSuppliersByEggType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eggTypeId } = req.params;
        const eggTypeSupplierRepository = data_source_1.AppDataSource.getRepository(EggTypeSupplier_1.EggTypeSupplier);
        const suppliers = yield eggTypeSupplierRepository.find({
            where: { eggType: { id: parseInt(eggTypeId, 10) } },
            relations: ["supplier"],
        });
        res.status(200).json(suppliers.map((s) => s.supplier));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener proveedores por tipo de huevo." });
    }
});
exports.getSuppliersByEggType = getSuppliersByEggType;
