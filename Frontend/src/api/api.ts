import axios from "axios";

// Interfaces para tipos complejos
interface ClientUpdateFields {
  rfc?: string;
  emailFiscal?: string;
  regimenFiscal?: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  codigoPostal?: string;
  alcaldiaMunicipio?: string;
  estado?: string;
  pais?: string;
}

interface RemissionDetail {
  eggTypeId: number;
  supplierId: number;
  boxCount: number;
  weights?: number[];
  weightTotal?: number;
  pricePerKilo: number;
  claveSatSnapshot?: string;
  unidadSat?: string;
}

interface InventoryMovement {
  eggTypeId: number;
  movementType: string;
  quantity: number;
  referenceId?: number;
  currentStock: number;
  details: string;
}

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para incluir el token en las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo centralizado de errores
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     "Error en la solicitud";
      throw new Error(message);
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    }
  }
  throw new Error("Error desconocido");
};

// Operaciones de autenticación
export const authApi = {
  login: async (data: { username: string; password: string }) => {
    try {
      return await api.post("/auth/login", data);
    } catch (error) {
      handleApiError(error);
    }
  },
  me: async () => {
    try {
      return await api.get("/auth/me");
    } catch (error) {
      handleApiError(error);
    }
  },
  refreshToken: async () => {
    try {
      return await api.post("/auth/refresh-token");
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Operaciones para Usuarios (Users)
export const userApi = {
  getAll: async () => {
    try {
      return await api.get("/users");
    } catch (error) {
      handleApiError(error);
    }
  },
  create: async (data: { username: string; password: string; role: number; status?: boolean }) => {
    try {
      return await api.post("/users", data);
    } catch (error) {
      handleApiError(error);
    }
  },
  update: async (id: number, data: { username?: string; role?: number; status?: boolean }) => {
    try {
      return await api.put(`/users/${id}`, data);
    } catch (error) {
      handleApiError(error);
    }
  },
  delete: async (id: number) => {
    try {
      return await api.delete(`/users/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Operaciones para Roles (Roles)
export const roleApi = {
  getAll: async () => {
    try {
      return await api.get("/roles");
    } catch (error) {
      handleApiError(error);
    }
  },
  create: async (data: { name: string; description?: string }) => {
    try {
      return await api.post("/roles", data);
    } catch (error) {
      handleApiError(error);
    }
  },
  assignPermissions: async (roleId: number, permissions: number[]) => {
    try {
      return await api.post("/roles/assign-permissions", { roleId, permissions });
    } catch (error) {
      handleApiError(error);
    }
  },
  removePermissions: async (roleId: number, permissions: number[]) => {
    try {
      return await api.post("/roles/remove-permissions", { roleId, permissions });
    } catch (error) {
      handleApiError(error);
    }
  },
  getPermissions: async (userId: number) => {
    try {
      return await api.get(`/users/${userId}/permissions`);
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Operaciones para Permisos (Permissions)
export const permissionApi = {
  getAll: async () => {
    try {
      return await api.get("/permissions");
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Operaciones para Módulos (Modules)
export const moduleApi = {
  getAll: async () => {
    try {
      return await api.get("/modules");
    } catch (error) {
      handleApiError(error);
    }
  },
  create: async (data: { name: string }) => {
    try {
      return await api.post("/modules", data);
    } catch (error) {
      handleApiError(error);
    }
  },
  assignModules: async (roleId: number, modules: number[]) => {
    try {
      return await api.post("/modules/assign", { roleId, modules });
    } catch (error) {
      handleApiError(error);
    }
  },
  removeModules: async (roleId: number, modules: number[]) => {
    try {
      return await api.post("/modules/remove", { roleId, modules });
    } catch (error) {
      handleApiError(error);
    }
  },
  getRoleModules: async (roleId: number) => {
    try {
      return await api.get(`/roles/${roleId}/modules`);
    } catch (error) {
      handleApiError(error);
    }
  },
  getUserModules: async (userId: number) => {
    try {
      return await api.get(`/users/${userId}/modules`);
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Operaciones para Tipos de Huevo (EggTypes)
export const eggTypeApi = {
  getAll: async () => {
    try {
      return await api.get("/types");
    } catch (error) {
      handleApiError(error);
    }
  },
  create: async (data: { name: string; description?: string; supplierId?: number }) => {
    try {
      return await api.post("/types", data);
    } catch (error) {
      handleApiError(error);
    }
  },
  update: async (
    id: number,
    data: { name?: string; description?: string; supplierId?: number }
  ) => {
    try {
      return await api.put(`/types/${id}`, data);
    } catch (error) {
      handleApiError(error);
    }
  },
  delete: async (id: number) => {
    try {
      return await api.delete(`/types/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
  getSuppliers: async (eggTypeId: number) => {
    try {
      return await api.get(`/types/${eggTypeId}/suppliers`);
    } catch (error) {
      handleApiError(error);
    }
  },
  getBySupplier: async (supplierId: number) => {
    try {
      return await api.get(`/suppliers/${supplierId}/egg-types`);
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Operaciones para Proveedores (Suppliers)
export const supplierApi = {
  getAll: async () => {
    try {
      return await api.get("/suppliers");
    } catch (error) {
      handleApiError(error);
    }
  },
  filter: async (params: { name?: string; contact_info?: string }) => {
    try {
      return await api.get("/suppliers/filter", { params });
    } catch (error) {
      handleApiError(error);
    }
  },
  create: async (data: {
    name: string;
    phone_number?: string;
    email?: string;
    address?: string;
  }) => {
    try {
      return await api.post("/suppliers", data);
    } catch (error) {
      handleApiError(error);
    }
  },
  update: async (
    id: number,
    data: {
      name?: string;
      phone_number?: string;
      email?: string;
      address?: string;
    }
  ) => {
    try {
      return await api.put(`/suppliers/${id}`, data);
    } catch (error) {
      handleApiError(error);
    }
  },
  delete: async (id: number) => {
    try {
      return await api.delete(`/suppliers/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Operaciones para Clientes (Clients)
export const clientApi = {
  getAll: async (params?: { name?: string; status?: boolean; startDate?: string; endDate?: string; rfc?: string; codigoPostal?: string }) => {
    try {
      return await api.get("/clients", { params });
    } catch (error) {
      handleApiError(error);
    }
  },
  getById: async (id: number) => {
    try {
      return await api.get(`/clients/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
  create: async (data: { 
    name: string; 
    contact_info: string; 
    status?: boolean;
    rfc?: string;
    emailFiscal?: string;
    regimenFiscal?: string;
    direccion?: {
      calle: string;
      numeroExterior: string;
      numeroInterior?: string;
      colonia: string;
      codigoPostal: string;
      alcaldiaMunicipio: string;
      estado: string;
      pais?: string;
    }
  }) => {
    try {
      return await api.post("/clients", data);
    } catch (error) {
      handleApiError(error);
    }
  },
  update: async (
    id: number,
    data: { 
      name?: string; 
      contact_info?: string; 
      status?: boolean;
      fiscalData?: ClientUpdateFields;
    }
  ) => {
    try {
      return await api.put(`/clients/${id}`, data);
    } catch (error) {
      handleApiError(error);
    }
  },
  delete: async (id: number) => {
    try {
      return await api.delete(`/clients/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
  validateRfc: async (rfc: string) => {
    try {
      return await api.post("/clients/validate-rfc", { rfc });
    } catch (error) {
      handleApiError(error);
    }
  },
  updateFiscalData: async (id: number, data: ClientUpdateFields) => {
    try {
      return await api.put(`/clients/${id}/fiscal-data`, data);
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Operaciones para Inventario (Inventory)
export const inventoryApi = {
  // Entradas de inventario
  getEntries: async (params?: {
    supplierId?: number;
    eggTypeId?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      return await api.get("/inventory/entries", { params });
    } catch (error) {
      handleApiError(error);
    }
  },
  getEntryById: async (id: number) => {
    try {
      return await api.get(`/inventory/entries/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
  createEntry: async (data: {
    supplierId: number;
    details: {
      eggTypeId: number;
      boxCount: number;
      weightTotal: number;
    }[];
  }) => {
    try {
      return await api.post("/inventory/entries", data);
    } catch (error) {
      handleApiError(error);
    }
  },
  updateEntry: async (
    id: number,
    data: {
      entryDetails: {
        eggTypeId: number;
        boxCount: number;
        weightTotal: number;
      }[];
    }
  ) => {
    try {
      return await api.put(`/inventory/entries/${id}`, data);
    } catch (error) {
      handleApiError(error);
    }
  },
  deleteEntry: async (id: number) => {
    try {
      return await api.delete(`/inventory/entries/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },

  // Stock
  getCurrentStock: async () => {
    try {
      return await api.get("/inventory/stock");
    } catch (error) {
      handleApiError(error);
    }
  },
  getStockByEggType: async (id: number) => {
    try {
      return await api.get(`/inventory/stock/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
  adjustStock: async (data: { eggTypeId: number; quantity: number; reason: string }) => {
    try {
      return await api.post("/inventory/adjust-stock", data);
    } catch (error) {
      handleApiError(error);
    }
  },

  // Movimientos
  getMovements: async (params?: {
    eggTypeId?: number;
    startDate?: string;
    endDate?: string;
    movementType?: string;
  }) => {
    try {
      return await api.get("/inventory/movements", { params });
    } catch (error) {
      handleApiError(error);
    }
  },
  getMovementTypes: async () => {
    try {
      return await api.get("/inventory/movement-types");
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Operaciones para Remisiones (Remissions)
export const remissionApi = {
  getAll: async (params?: { clientId?: number; startDate?: string; endDate?: string }) => {
    try {
      return await api.get("/remissions", { params });
    } catch (error) {
      handleApiError(error);
    }
  },
  getById: async (id: number) => {
    try {
      return await api.get(`/remissions/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
  create: async (data: { 
    date: string; 
    clientId: number; 
    details: RemissionDetail[] 
  }) => {
    try {
      return await api.post("/remissions", data);
    } catch (error) {
      handleApiError(error);
    }
  },
  update: async (
    id: number,
    data: { date?: string; clientId?: number }
  ) => {
    try {
      return await api.put(`/remissions/${id}`, data);
    } catch (error) {
      handleApiError(error);
    }
  },
  delete: async (id: number) => {
    try {
      return await api.delete(`/remissions/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },

  // Detalles de remisión
  createDetail: async (data: {
    remissionId: number;
    eggTypeId: number;
    supplierId: number;
    boxCount: number;
    isByBox: boolean;
    weights?: number[];
    weightTotal?: number;
    pricePerKilo: number;
    claveSatSnapshot?: string;
  }) => {
    try {
      return await api.post("/remissions/details", data);
    } catch (error) {
      handleApiError(error);
    }
  },
  getDetail: async (id: number) => {
    try {
      return await api.get(`/remissions/details/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
  updateDetail: async (
    id: number,
    data: {
      boxCount?: number;
      isByBox?: boolean;
      weights?: number[];
      estimatedWeightPerBox?: number;
      pricePerKilo?: number;
    }
  ) => {
    try {
      return await api.put(`/remissions/details/${id}`, data);
    } catch (error) {
      handleApiError(error);
    }
  },
  getCurrentPrices: async () => {
    try {
      return await api.get("/remissions/prices");
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Operaciones para Pagos (Payments)
export const paymentApi = {
  getAll: async (params?: {
    clientId?: number;
    startDate?: string;
    endDate?: string;
    method?: string;
    minAmount?: number;
    maxAmount?: number;
  }) => {
    try {
      return await api.get("/payments", { params });
    } catch (error) {
      handleApiError(error);
    }
  },
  getById: async (id: number) => {
    try {
      return await api.get(`/payments/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
  create: async (data: {
    clientId: number;
    paymentDetails: {
      remissionId: number;
      amountAssigned: number;
    }[];
    method: string;
  }) => {
    try {
      return await api.post("/payments", data);
    } catch (error) {
      handleApiError(error);
    }
  },
  update: async (
    id: number,
    data: { amount?: number; method?: string }
  ) => {
    try {
      return await api.put(`/payments/${id}`, data);
    } catch (error) {
      handleApiError(error);
    }
  },
  delete: async (id: number) => {
    try {
      return await api.delete(`/payments/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Operaciones para Facturación (Billing)
export const billingApi = {
  generateInvoice: async (remissionId: number) => {
    try {
      return await api.post("/billing/generate", { remissionId });
    } catch (error) {
      handleApiError(error);
    }
  },
};

export default api;