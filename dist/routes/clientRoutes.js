"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ClientController_1 = require("../controllers/ClientController");
const router = express_1.default.Router();
router.get("/", 
// authenticateToken,
// checkPermission("view_clients"),
ClientController_1.getClients);
router.get("/:id", 
// authenticateToken,
// checkPermission("view_clients"),
ClientController_1.getClientById);
router.post("/", 
// authenticateToken,
// checkPermission("create_clients"),
ClientController_1.createClient);
router.put("/:id", 
// authenticateToken,
// checkPermission("update_clients"),
ClientController_1.updateClient);
router.delete("/:id", 
// authenticateToken,
// checkPermission("delete_clients"),
ClientController_1.deleteClient);
exports.default = router;
