import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { EggType } from '../models/EggType';
import { Supplier } from '../models/Supplier';
import { InventoryEntry } from '../models/InventoryEntry';
import { InventoryEntryDetail } from '../models/InventoryEntryDetail';
import { RemissionDetail } from '../models/RemissionDetail';
import { Remission } from '../models/Remission';
import { Client } from '../models/Client';
import { BoxWeight } from '../models/BoxWeight';
import { RolePermission } from '../models/RolePermission';
import { Module } from '../models/Modules';
import { RoleModule } from '../models/RoleModule';
import { EggTypeSupplier } from '../models/EggTypeSupplier';
import {InventoryMovement} from '../models/InventoryMovement';
import { Payment } from '../models/Payment';
import { PaymentDetail } from '../models/PaymentDetail';
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ path: join(__dirname, "./../../../Frontend/.env") }); 


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'db',
  synchronize: true,
  logging: true,
  entities: [
    EggType,
    EggTypeSupplier,
    Module,
    User,
    RoleModule,
    Role,
    Permission,
    Supplier,
    InventoryEntry,
    InventoryEntryDetail,
    RemissionDetail,
    Remission,
    Client,
    BoxWeight,
    Payment,
    PaymentDetail,
    RolePermission,
    InventoryMovement,
  ],
});
