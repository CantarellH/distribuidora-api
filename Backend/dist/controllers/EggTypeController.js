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
exports.deleteEggType = exports.updateEggType = exports.createEggType = exports.getEggTypes = void 0;
const data_source_1 = require("../config/data-source");
const EggType_1 = require("../models/EggType");
const getEggTypes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eggTypeRepository = data_source_1.AppDataSource.getRepository(EggType_1.EggType);
        const eggTypes = yield eggTypeRepository.find();
        res.status(200).json(eggTypes);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los tipos de huevo" });
    }
});
exports.getEggTypes = getEggTypes;
const createEggType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ error: "El nombre es obligatorio" });
            return;
        }
        const eggTypeRepository = data_source_1.AppDataSource.getRepository(EggType_1.EggType);
        const newEggType = eggTypeRepository.create({ name, description });
        yield eggTypeRepository.save(newEggType);
        res.status(201).json(newEggType);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear el tipo de huevo" });
    }
});
exports.createEggType = createEggType;
const updateEggType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const eggTypeRepository = data_source_1.AppDataSource.getRepository(EggType_1.EggType);
        const eggType = yield eggTypeRepository.findOneBy({ id: parseInt(id, 10) });
        if (!eggType) {
            res.status(404).json({ error: "Tipo de huevo no encontrado" });
            return;
        }
        eggType.name = name || eggType.name;
        eggType.description = description || eggType.description;
        yield eggTypeRepository.save(eggType);
        res.status(200).json(eggType);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el tipo de huevo" });
    }
});
exports.updateEggType = updateEggType;
const deleteEggType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const eggTypeRepository = data_source_1.AppDataSource.getRepository(EggType_1.EggType);
        const eggType = yield eggTypeRepository.findOneBy({ id: parseInt(id, 10) });
        if (!eggType) {
            res.status(404).json({ error: "Tipo de huevo no encontrado" });
            return;
        }
        yield eggTypeRepository.remove(eggType);
        res.status(200).json({ message: "Tipo de huevo eliminado correctamente" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar el tipo de huevo" });
    }
});
exports.deleteEggType = deleteEggType;
