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
exports.deleteRemission = exports.updateRemission = exports.updateRemissionDetail = exports.filterRemissions = exports.getRemissionById = exports.getRemissionDetail = exports.getRemissions = exports.createRemissionDetail = exports.createRemission = void 0;
const data_source_1 = require("../config/data-source");
const Remission_1 = require("../models/Remission");
const RemissionDetail_1 = require("../models/RemissionDetail");
const BoxWeight_1 = require("../models/BoxWeight");
const EggType_1 = require("../models/EggType");
const Client_1 = require("../models/Client");
const PaymentDetail_1 = require("../models/PaymentDetail");
const Supplier_1 = require("../models/Supplier");
const createRemission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, clientId, details } = req.body;
        if (!date || !clientId) {
            res.status(400).json({
                error: "Los campos 'date' y 'clientId' son obligatorios.",
            });
            return;
        }
        const client = yield data_source_1.AppDataSource.getRepository(Client_1.Client).findOneBy({
            id: clientId,
        });
        if (!client) {
            res.status(404).json({ error: "Cliente no encontrado." });
            return;
        }
        const remissionRepository = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const remission = remissionRepository.create({ date, client });
        const savedRemission = yield remissionRepository.save(remission);
        // Si se incluyen detalles en la solicitud, crear cada uno
        if (details && Array.isArray(details)) {
            const remissionDetailRepository = data_source_1.AppDataSource.getRepository(RemissionDetail_1.RemissionDetail);
            for (const detail of details) {
                const { eggTypeId, supplierId, boxCount, isByBox, weights, estimatedWeightPerBox, } = detail;
                if (!eggTypeId || !supplierId || !boxCount || isByBox === undefined) {
                    res.status(400).json({
                        error: "Detalles de remisión inválidos. Faltan campos obligatorios.",
                    });
                    return;
                }
                const eggType = yield data_source_1.AppDataSource.getRepository(EggType_1.EggType).findOneBy({
                    id: eggTypeId,
                });
                const supplier = yield data_source_1.AppDataSource.getRepository(Supplier_1.Supplier).findOneBy({
                    id: supplierId,
                });
                if (!eggType || !supplier) {
                    res.status(404).json({
                        error: `Tipo de huevo o proveedor no encontrado para el detalle.`,
                    });
                    return;
                }
                const weightTotal = isByBox
                    ? weights.reduce((total, weight) => total + weight - 2, 0) // Tara de 2 kg
                    : estimatedWeightPerBox * boxCount;
                const remissionDetail = remissionDetailRepository.create({
                    remission: savedRemission,
                    eggType,
                    supplier,
                    boxCount,
                    isByBox,
                    weightTotal,
                    estimatedWeightPerBox: isByBox ? 0 : estimatedWeightPerBox,
                });
                yield remissionDetailRepository.save(remissionDetail);
                // Guardar pesos individuales si es por caja
                if (isByBox && weights) {
                    const boxWeightRepository = data_source_1.AppDataSource.getRepository(BoxWeight_1.BoxWeight);
                    for (const weight of weights) {
                        const boxWeight = boxWeightRepository.create({
                            remissionDetail,
                            weight: weight - 2, // Tara de 2 kg por caja
                        });
                        yield boxWeightRepository.save(boxWeight);
                    }
                }
            }
        }
        res
            .status(201)
            .json({
            message: "Remisión creada con éxito.",
            remission: savedRemission,
        });
    }
    catch (error) {
        console.error("Error al crear la remisión:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.createRemission = createRemission;
const createRemissionDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { remissionId, eggTypeId, supplierId, boxCount, isByBox, weights, estimatedWeightPerBox, } = req.body;
        if (!remissionId ||
            !eggTypeId ||
            !supplierId ||
            !boxCount ||
            isByBox === undefined) {
            res.status(400).json({
                error: "Todos los campos obligatorios deben estar presentes.",
            });
            return;
        }
        const remission = yield data_source_1.AppDataSource.getRepository(Remission_1.Remission).findOne({
            where: { id: remissionId },
        });
        if (!remission) {
            res.status(404).json({ error: "Remisión no encontrada." });
            return;
        }
        const eggType = yield data_source_1.AppDataSource.getRepository(EggType_1.EggType).findOne({
            where: { id: eggTypeId },
        });
        if (!eggType) {
            res.status(404).json({ error: "Tipo de huevo no encontrado." });
            return;
        }
        const supplier = yield data_source_1.AppDataSource.getRepository(Supplier_1.Supplier).findOne({
            where: { id: supplierId },
        });
        if (!supplier) {
            res.status(404).json({ error: "Proveedor no encontrado." });
            return;
        }
        if (isByBox && (!weights || weights.length !== boxCount)) {
            res
                .status(400)
                .json({ error: "Se requieren los pesos individuales para cada caja." });
            return;
        }
        const remissionDetailRepository = data_source_1.AppDataSource.getRepository(RemissionDetail_1.RemissionDetail);
        const boxWeightRepository = data_source_1.AppDataSource.getRepository(BoxWeight_1.BoxWeight);
        const weightTotal = isByBox
            ? weights.reduce((total, weight) => total + weight - 2, 0) // Tara de 2 kg por caja
            : estimatedWeightPerBox * boxCount;
        const remissionDetail = remissionDetailRepository.create({
            remission,
            eggType,
            supplier,
            boxCount,
            isByBox,
            weightTotal,
            estimatedWeightPerBox: isByBox ? 0 : estimatedWeightPerBox,
        });
        yield remissionDetailRepository.save(remissionDetail);
        if (isByBox && weights) {
            for (const weight of weights) {
                const boxWeight = boxWeightRepository.create({
                    remissionDetail,
                    weight: weight - 2, // Restar la tara de 2 kg por caja
                });
                yield boxWeightRepository.save(boxWeight);
            }
        }
        res.status(201).json({
            message: "Detalle de remisión creado con éxito.",
            remissionDetail,
        });
    }
    catch (error) {
        console.error("Error al crear el detalle de remisión:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.createRemissionDetail = createRemissionDetail;
const getRemissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const remissions = yield data_source_1.AppDataSource.getRepository(Remission_1.Remission).find({
            relations: ["client", "details", "paymentDetails"],
        });
        res.status(200).json(remissions);
    }
    catch (error) {
        console.error("Error al obtener las remisiones:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getRemissions = getRemissions;
const getRemissionDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const remissionDetail = yield data_source_1.AppDataSource.getRepository(RemissionDetail_1.RemissionDetail).findOne({
            where: { id: parseInt(id, 10) },
            relations: ["boxWeights", "eggType", "supplier", "remission"],
        });
        if (!remissionDetail) {
            res.status(404).json({ error: "Detalle de remisión no encontrado." });
            return;
        }
        res.status(200).json(remissionDetail);
    }
    catch (error) {
        console.error("Error al obtener el detalle de remisión:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getRemissionDetail = getRemissionDetail;
const getRemissionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const remissionRepository = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const remission = yield remissionRepository.findOne({
            where: { id: parseInt(id, 10) },
            relations: [
                "client",
                "details",
                "paymentDetails",
                "paymentDetails.payment",
            ],
        });
        if (!remission) {
            res.status(404).json({ error: "Remisión no encontrada." });
            return;
        }
        res.status(200).json(remission);
    }
    catch (error) {
        console.error("Error al obtener la remisión:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getRemissionById = getRemissionById;
const filterRemissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, clientId } = req.query;
        const remissionRepository = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const query = remissionRepository
            .createQueryBuilder("remission")
            .leftJoinAndSelect("remission.client", "client")
            .leftJoinAndSelect("remission.details", "details");
        if (startDate && endDate) {
            query.andWhere("remission.date BETWEEN :startDate AND :endDate", {
                startDate,
                endDate,
            });
        }
        if (clientId) {
            query.andWhere("client.id = :clientId", { clientId });
        }
        const remissions = yield query.getMany();
        res.json(remissions);
    }
    catch (error) {
        console.error("Error filtering remissions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.filterRemissions = filterRemissions;
const updateRemissionDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { boxCount, isByBox, weights, estimatedWeightPerBox } = req.body;
        const remissionDetailRepository = data_source_1.AppDataSource.getRepository(RemissionDetail_1.RemissionDetail);
        const boxWeightRepository = data_source_1.AppDataSource.getRepository(BoxWeight_1.BoxWeight);
        const remissionDetail = yield remissionDetailRepository.findOne({
            where: { id: parseInt(id, 10) },
            relations: ["boxWeights"],
        });
        if (!remissionDetail) {
            res.status(404).json({ error: "Detalle de remisión no encontrado." });
            return;
        }
        remissionDetail.boxCount = boxCount || remissionDetail.boxCount;
        remissionDetail.isByBox =
            isByBox !== undefined ? isByBox : remissionDetail.isByBox;
        remissionDetail.estimatedWeightPerBox = isByBox
            ? 0
            : estimatedWeightPerBox || remissionDetail.estimatedWeightPerBox;
        if (isByBox && weights) {
            yield boxWeightRepository.delete({ remissionDetail }); // Eliminar pesos antiguos
            remissionDetail.weightTotal = weights.reduce((total, weight) => total + weight - 2, 0);
            for (const weight of weights) {
                const boxWeight = boxWeightRepository.create({
                    remissionDetail,
                    weight: weight - 2,
                });
                yield boxWeightRepository.save(boxWeight);
            }
        }
        else if (!isByBox) {
            remissionDetail.weightTotal =
                remissionDetail.estimatedWeightPerBox * remissionDetail.boxCount;
        }
        yield remissionDetailRepository.save(remissionDetail);
        res.status(200).json({
            message: "Detalle de remisión actualizado con éxito.",
            remissionDetail,
        });
    }
    catch (error) {
        console.error("Error al actualizar el detalle de remisión:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.updateRemissionDetail = updateRemissionDetail;
const updateRemission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { date, clientId } = req.body;
    try {
        const remissionRepository = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const remission = yield remissionRepository.findOne({
            where: { id: parseInt(id, 10) },
        });
        if (!remission) {
            res.status(404).json({ error: "Remisión no encontrada." });
            return;
        }
        remission.date = date || remission.date;
        if (clientId) {
            const client = yield data_source_1.AppDataSource.getRepository(Client_1.Client).findOneBy({
                id: clientId,
            });
            if (!client) {
                res.status(404).json({ error: "Cliente no encontrado." });
                return;
            }
            remission.client = client;
        }
        yield remissionRepository.save(remission);
        res
            .status(200)
            .json({ message: "Remisión actualizada con éxito.", remission });
    }
    catch (error) {
        console.error("Error al actualizar la remisión:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.updateRemission = updateRemission;
const deleteRemission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const remissionRepository = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const remission = yield remissionRepository.findOne({
            where: { id: parseInt(id, 10) },
            relations: ["paymentDetails"],
        });
        if (!remission) {
            res.status(404).json({ error: "Remisión no encontrada." });
            return;
        }
        // Eliminar detalles de pago relacionados
        for (const paymentDetail of remission.paymentDetails) {
            yield data_source_1.AppDataSource.getRepository(PaymentDetail_1.PaymentDetail).remove(paymentDetail);
        }
        // Eliminar la remisión
        yield remissionRepository.remove(remission);
        res.status(200).json({ message: "Remisión eliminada con éxito." });
    }
    catch (error) {
        console.error("Error al eliminar la remisión:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.deleteRemission = deleteRemission;
