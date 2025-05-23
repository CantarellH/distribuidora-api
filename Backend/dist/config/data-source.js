"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const Permission_1 = require("../models/Permission");
const EggType_1 = require("../models/EggType");
const Supplier_1 = require("../models/Supplier");
const InventoryEntry_1 = require("../models/InventoryEntry");
const InventoryEntryDetail_1 = require("../models/InventoryEntryDetail");
const RemissionDetail_1 = require("../models/RemissionDetail");
const Remission_1 = require("../models/Remission");
const Client_1 = require("../models/Client");
const BoxWeight_1 = require("../models/BoxWeight");
const RolePermission_1 = require("../models/RolePermission");
const Modules_1 = require("../models/Modules");
const RoleModule_1 = require("../models/RoleModule");
const EggTypeSupplier_1 = require("../models/EggTypeSupplier");
const Payment_1 = require("../models/Payment");
const PaymentDetail_1 = require("../models/PaymentDetail");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'Admin',
    password: process.env.DB_PASS || 'C4nt4rell',
    database: process.env.DB_NAME || 'Comercializadora_Carreta',
    synchronize: false,
    logging: true,
    entities: [
        EggType_1.EggType,
        EggTypeSupplier_1.EggTypeSupplier,
        Modules_1.Module,
        User_1.User,
        RoleModule_1.RoleModule,
        Role_1.Role,
        Permission_1.Permission,
        Supplier_1.Supplier,
        InventoryEntry_1.InventoryEntry,
        InventoryEntryDetail_1.InventoryEntryDetail,
        RemissionDetail_1.RemissionDetail,
        Remission_1.Remission,
        Client_1.Client,
        BoxWeight_1.BoxWeight,
        Payment_1.Payment,
        PaymentDetail_1.PaymentDetail,
        RolePermission_1.RolePermission,
    ],
});
