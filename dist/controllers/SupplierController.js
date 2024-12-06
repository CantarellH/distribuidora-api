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
exports.filterSuppliers = exports.deleteSupplier = exports.updateSupplier = exports.createSupplier = exports.getSuppliers = void 0;
const data_source_1 = require("../config/data-source");
const Supplier_1 = require("../models/Supplier");
const getSuppliers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const supplierRepository = data_source_1.AppDataSource.getRepository(Supplier_1.Supplier);
        const suppliers = yield supplierRepository.find();
        res.status(200).json(suppliers);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener proveedores." });
    }
});
exports.getSuppliers = getSuppliers;
const createSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, contact_info } = req.body;
        if (!name) {
            res
                .status(400)
                .json({ error: "El nombre del proveedor es obligatorio." });
            return;
        }
        const supplierRepository = data_source_1.AppDataSource.getRepository(Supplier_1.Supplier);
        const existingSupplier = yield supplierRepository.findOneBy({ name });
        if (existingSupplier) {
            res.status(400).json({ error: "El proveedor ya existe." });
            return;
        }
        const newSupplier = supplierRepository.create({ name, contact_info });
        const savedSupplier = yield supplierRepository.save(newSupplier);
        res.status(201).json(savedSupplier);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear proveedor." });
    }
});
exports.createSupplier = createSupplier;
const updateSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, contact_info } = req.body;
        const supplierRepository = data_source_1.AppDataSource.getRepository(Supplier_1.Supplier);
        // Verificar si el proveedor existe
        const supplier = yield supplierRepository.findOneBy({
            id: parseInt(id, 10),
        });
        if (!supplier) {
            res.status(404).json({ error: "Proveedor no encontrado." });
            return;
        }
        // Verificar si el nuevo nombre ya existe en otro proveedor
        if (name) {
            const existingSupplier = yield supplierRepository.findOneBy({ name });
            if (existingSupplier && existingSupplier.id !== supplier.id) {
                res
                    .status(400)
                    .json({ error: "Ya existe un proveedor con este nombre." });
                return;
            }
        }
        // Actualizar los campos del proveedor
        supplier.name = name || supplier.name;
        supplier.contact_info = contact_info || supplier.contact_info;
        const updatedSupplier = yield supplierRepository.save(supplier);
        res.status(200).json(updatedSupplier);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar proveedor." });
    }
});
exports.updateSupplier = updateSupplier;
const deleteSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const supplierRepository = data_source_1.AppDataSource.getRepository(Supplier_1.Supplier);
        const supplier = yield supplierRepository.findOneBy({
            id: parseInt(id, 10),
        });
        if (!supplier) {
            res.status(404).json({ error: "Proveedor no encontrado." });
            return;
        }
        yield supplierRepository.remove(supplier);
        res.status(200).json({ message: "Proveedor eliminado correctamente." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar proveedor." });
    }
});
exports.deleteSupplier = deleteSupplier;
const filterSuppliers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, contact_info } = req.query;
        const supplierRepository = data_source_1.AppDataSource.getRepository(Supplier_1.Supplier);
        // Construir consulta dinámica
        const query = supplierRepository.createQueryBuilder("supplier");
        // Filtrar por nombre si se proporciona
        if (name) {
            query.andWhere("supplier.name ILIKE :name", { name: `%${name}%` });
        }
        // Filtrar por información de contacto si se proporciona
        if (contact_info) {
            query.andWhere("supplier.contact_info ILIKE :contact_info", {
                contact_info: `%${contact_info}%`,
            });
        }
        // Ejecutar la consulta
        const suppliers = yield query.getMany();
        res.status(200).json(suppliers);
    }
    catch (error) {
        console.error("Error al filtrar proveedores:", error);
        res.status(500).json({ error: "Error al filtrar proveedores." });
    }
});
exports.filterSuppliers = filterSuppliers;
