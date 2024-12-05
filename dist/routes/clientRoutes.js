"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ClientController_1 = require("../controllers/ClientController");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = express_1.default.Router();
router.get("/", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("view_clients"), ClientController_1.getClients);
router.get("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("view_clients"), ClientController_1.getClientById);
router.post("/", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("create_clients"), ClientController_1.createClient);
router.put("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("update_clients"), ClientController_1.updateClient);
router.delete("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("delete_clients"), ClientController_1.deleteClient);
exports.default = router;
