"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EggTypeSupplierController_1 = require("../controllers/EggTypeSupplierController");
const router = (0, express_1.Router)();
router.post("/egg-type-supplier", EggTypeSupplierController_1.linkEggTypeToSupplier);
router.get("/suppliers/:supplierId/egg-types", EggTypeSupplierController_1.getEggTypesBySupplier);
router.get("/egg-types/:eggTypeId/suppliers", EggTypeSupplierController_1.getSuppliersByEggType);
exports.default = router;
