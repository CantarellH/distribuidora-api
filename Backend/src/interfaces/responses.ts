// src/interfaces/responses.ts
import { EggType } from "../models/EggType";
import { Supplier } from "../models/Supplier";

export interface EggTypeResponse {
  id: number;
  name: string;
  description?: string;
  claveSat: string;
  unidadSat: string;
  claveUnidadSat: string;
  createdAt: Date;
  updatedAt: Date;
  suppliers: Supplier[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}