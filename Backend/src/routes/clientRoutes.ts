import express from "express";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  validateRfc,
} from "../controllers/ClientController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { checkPermission } from "../middlewares/checkPermission";

const router = express.Router();

router.get(
  "/",
  // authenticateToken,
  // checkPermission("view_clients"),
  getClients
); 

router.get(
  "/:id",
  // authenticateToken,
  // checkPermission("view_clients"),
  getClientById
); 

router.post(
  "/",
  // authenticateToken,
  // checkPermission("create_clients"),
  createClient
); 

router.put(
  "/:id",
  // authenticateToken,
  // checkPermission("update_clients"),
  updateClient
);

router.delete(
  "/:id",
  // authenticateToken,
  // checkPermission("delete_clients"),
  deleteClient
); 

router.get(
  "/validate-rfc/:rfc",
  // authenticateToken,
  // checkPermission("view_clients"),
  validateRfc
);


export default router;
