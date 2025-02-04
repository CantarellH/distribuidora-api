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
        let totalWeight = 0; // Peso total acumulado de la remisión
        let totalCost = 0; // Costo total acumulado de la remisión
        if (details && Array.isArray(details)) {
            const remissionDetailRepository = data_source_1.AppDataSource.getRepository(RemissionDetail_1.RemissionDetail);
            for (const detail of details) {
                const { eggTypeId, supplierId, boxCount, weights, weightTotal, pricePerKilo, } = detail;
                if (!eggTypeId || !supplierId || !boxCount || !pricePerKilo) {
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
                if (weights && weights.length !== boxCount) {
                    res.status(400).json({
                        error: "Para salidas por caja, se requieren los pesos individuales.",
                    });
                    return;
                }
                // Cálculo del peso total
                const computedWeightTotal = weights
                    ? weights.reduce((total, weight) => total + weight - 2, 0) // Tara de 2 kg por caja
                    : weightTotal;
                if (!computedWeightTotal) {
                    res.status(400).json({
                        error: "Debe proporcionar 'weights' para salidas por caja o 'weightTotal' para salidas por tarima.",
                    });
                    return;
                }
                // Cálculo del peso estimado por caja para tarima
                const estimatedWeightPerBox = weights
                    ? 0
                    : parseFloat(((weightTotal - boxCount * 2) / boxCount).toFixed(2));
                // Cálculo del costo total del detalle
                const totalDetailCost = computedWeightTotal * pricePerKilo;
                totalWeight += computedWeightTotal; // Acumular peso total
                totalCost += totalDetailCost; // Acumular costo total
                const remissionDetail = remissionDetailRepository.create({
                    remission: savedRemission,
                    eggType,
                    supplier,
                    boxCount,
                    isByBox: !!weights, // Si hay pesos, es salida por caja
                    weightTotal: computedWeightTotal,
                    estimatedWeightPerBox,
                    pricePerKilo,
                });
                yield remissionDetailRepository.save(remissionDetail);
                // Guardar pesos individuales si es por caja
                if (weights) {
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
        // Actualizar peso total y costo total en la remisión
        savedRemission.weightTotal = totalWeight;
        savedRemission.totalCost = totalCost;
        yield remissionRepository.save(savedRemission);
        res.status(201).json({
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
        const { remissionId, eggTypeId, supplierId, boxCount, isByBox, weights, weightTotal, // Peso total de la tarima
        pricePerKilo, } = req.body;
        if (!remissionId ||
            !eggTypeId ||
            !supplierId ||
            !boxCount ||
            !weightTotal ||
            !pricePerKilo ||
            isByBox === undefined) {
            res.status(400).json({
                error: "Todos los campos obligatorios deben estar presentes.",
            });
            return;
        }
        const remission = yield data_source_1.AppDataSource.getRepository(Remission_1.Remission).findOne({
            where: { id: remissionId },
            relations: ["details"], // Para actualizar los totales
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
        const remissionDetailRepository = data_source_1.AppDataSource.getRepository(RemissionDetail_1.RemissionDetail);
        const boxWeightRepository = data_source_1.AppDataSource.getRepository(BoxWeight_1.BoxWeight);
        let calculatedWeightTotal;
        let estimatedWeightPerBox = 0;
        if (isByBox) {
            // Validación adicional para pesos individuales
            if (!weights || weights.length !== boxCount) {
                res.status(400).json({
                    error: "Se requieren los pesos individuales para cada caja si la remisión es por caja.",
                });
                return;
            }
            calculatedWeightTotal = weights.reduce((total, weight) => total + weight - 2, 0); // Restamos la tara de 2 kg por caja
            // Guardar pesos individuales
            for (const weight of weights) {
                const boxWeight = boxWeightRepository.create({
                    remissionDetail: null, // Temporalmente null hasta que guardemos el detalle
                    weight: weight - 2, // Restar la tara de 2 kg
                });
                yield boxWeightRepository.save(boxWeight);
            }
        }
        else {
            // Es por tarima
            estimatedWeightPerBox = parseFloat(((weightTotal - boxCount * 2) / boxCount).toFixed(2)); // Peso estimado por caja
            calculatedWeightTotal = weightTotal; // Se toma directamente el peso total
        }
        // Calcular costo total del detalle
        const totalDetailCost = calculatedWeightTotal * pricePerKilo;
        const remissionDetail = remissionDetailRepository.create({
            remission,
            eggType,
            supplier,
            boxCount,
            isByBox,
            weightTotal: calculatedWeightTotal,
            estimatedWeightPerBox,
            pricePerKilo,
        });
        const savedRemissionDetail = yield remissionDetailRepository.save(remissionDetail);
        // Si es por caja, actualizar referencia en boxWeights
        if (isByBox && weights) {
            const savedRemissionDetail = yield remissionDetailRepository.save(remissionDetail);
            for (const weight of weights) {
                const boxWeight = boxWeightRepository.create({
                    remissionDetail: savedRemissionDetail, // Asignar el detalle de la remisión después de guardarlo
                    weight: weight - 2, // Restar la tara de 2 kg
                });
                yield boxWeightRepository.save(boxWeight);
            }
        }
        // Actualizar los totales de la remisión
        remission.weightTotal =
            remission.details.reduce((sum, detail) => sum + detail.weightTotal, 0) +
                calculatedWeightTotal;
        remission.totalCost =
            remission.details.reduce((sum, detail) => sum + detail.pricePerKilo * detail.weightTotal, 0) + totalDetailCost;
        yield data_source_1.AppDataSource.getRepository(Remission_1.Remission).save(remission);
        res.status(201).json({
            message: "Detalle de remisión creado con éxito.",
            remissionDetail: savedRemissionDetail,
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
        const { boxCount, isByBox, weights, estimatedWeightPerBox, pricePerKilo, } = req.body;
        const remissionDetailRepository = data_source_1.AppDataSource.getRepository(RemissionDetail_1.RemissionDetail);
        const boxWeightRepository = data_source_1.AppDataSource.getRepository(BoxWeight_1.BoxWeight);
        const remissionDetail = yield remissionDetailRepository.findOne({
            where: { id: parseInt(id, 10) },
            relations: ["boxWeights", "remission"],
        });
        if (!remissionDetail) {
            res.status(404).json({ error: "Detalle de remisión no encontrado." });
            return;
        }
        // Actualizar campos básicos
        remissionDetail.boxCount = boxCount || remissionDetail.boxCount;
        remissionDetail.isByBox =
            isByBox !== undefined ? isByBox : remissionDetail.isByBox;
        remissionDetail.estimatedWeightPerBox = isByBox
            ? 0
            : estimatedWeightPerBox || remissionDetail.estimatedWeightPerBox;
        let weightTotal = 0;
        if (isByBox && weights) {
            // Si es por caja, eliminar pesos antiguos y calcular nuevos
            yield boxWeightRepository.delete({ remissionDetail });
            weightTotal = weights.reduce((total, weight) => total + weight - 2, // Tara de 2 kg por caja
            0);
            for (const weight of weights) {
                const boxWeight = boxWeightRepository.create({
                    remissionDetail,
                    weight: weight - 2,
                });
                yield boxWeightRepository.save(boxWeight);
            }
        }
        else if (!isByBox) {
            // Si no es por caja, calcular peso total basado en el peso estimado por caja
            weightTotal = remissionDetail.estimatedWeightPerBox * remissionDetail.boxCount;
        }
        remissionDetail.weightTotal = weightTotal;
        remissionDetail.pricePerKilo = pricePerKilo || remissionDetail.pricePerKilo;
        // Actualizar costo total basado en el peso total y el precio por kilo
        const totalDetailCost = weightTotal * remissionDetail.pricePerKilo;
        // Actualizar el detalle de la remisión
        yield remissionDetailRepository.save(remissionDetail);
        // Actualizar el costo total de la remisión principal
        const remissionRepository = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const remission = remissionDetail.remission;
        remission.totalCost =
            (remission.totalCost || 0) -
                remissionDetail.weightTotal * remissionDetail.pricePerKilo + // Costo anterior
                totalDetailCost; // Costo actualizado
        yield remissionRepository.save(remission);
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
            relations: ["details"], // Para actualizar el costo total en caso de cambios
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
        // Recalcular el costo total basado en los detalles
        remission.totalCost = remission.details.reduce((total, detail) => total + detail.weightTotal * detail.pricePerKilo, 0);
        yield remissionRepository.save(remission);
        res.status(200).json({
            message: "Remisión actualizada con éxito.",
            remission,
        });
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
