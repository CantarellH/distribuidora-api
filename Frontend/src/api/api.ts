import axios from "axios";

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
/*nst handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response) {
    throw new Error(error.response.data.message || error.response.data.error || "Error en la solicitud");
  } else {
    throw new Error("Error de conexión con el servidor");
  }
};*/

// Operaciones de autenticación
export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  refreshToken: () => api.post("/auth/refresh-token"),
};

// Operaciones para Usuarios (Users)
export const userApi = {
  getAll: () => api.get("/users"),
  create: (data: { username: string; password: string; role: number; status?: boolean }) =>
    api.post("/users", data),
  update: (id: number, data: { username?: string; role?: number; status?: boolean }) =>
    api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Operaciones para Roles (Roles)
export const roleApi = {
  getAll: () => api.get("/roles"),
  create: (data: { name: string; description?: string }) =>
    api.post("/roles", data),
  assignPermissions: (roleId: number, permissions: number[]) =>
    api.post("/roles/assign-permissions", { roleId, permissions }),
  removePermissions: (roleId: number, permissions: number[]) =>
    api.post("/roles/remove-permissions", { roleId, permissions }),
  getPermissions: (userId: number) =>
    api.get(`/users/${userId}/permissions`),
};

// Operaciones para Permisos (Permissions)
export const permissionApi = {
  getAll: () => api.get("/permissions"),
};

// Operaciones para Módulos (Modules)
export const moduleApi = {
  getAll: () => api.get("/modules"),
  create: (data: { name: string }) => api.post("/modules", data),
  assignModules: (roleId: number, modules: number[]) =>
    api.post("/modules/assign", { roleId, modules }),
  removeModules: (roleId: number, modules: number[]) =>
    api.post("/modules/remove", { roleId, modules }),
  getRoleModules: (roleId: number) => api.get(`/roles/${roleId}/modules`),
  getUserModules: (userId: number) => api.get(`/users/${userId}/modules`),
};

// Operaciones para Tipos de Huevo (EggTypes)
export const eggTypeApi = {
  getAll: () => api.get("/types"),
  create: (data: { name: string; description?: string; supplierId?: number }) =>
    api.post("/types", data),
  update: (
    id: number,
    data: { name?: string; description?: string; supplierId?: number }
  ) => api.put(`/types/${id}`, data),
  delete: (id: number) => api.delete(`/types/${id}`),
  getSuppliers: (eggTypeId: number) => api.get(`/types/${eggTypeId}/suppliers`),
  getBySupplier: (supplierId: number) => api.get(`/suppliers/${supplierId}/egg-types`),
};

// Operaciones para Proveedores (Suppliers)
export const supplierApi = {
  getAll: () => api.get("/suppliers"),
  filter: (params: { name?: string; contact_info?: string }) =>
    api.get("/suppliers/filter", { params }),
  create: (data: {
    name: string;
    phone_number?: string;
    email?: string;
    address?: string;
  }) => api.post("/suppliers", data),
  update: (
    id: number,
    data: {
      name?: string;
      phone_number?: string;
      email?: string;
      address?: string;
    }
  ) => api.put(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
};

// Operaciones para Clientes (Clients)
export const clientApi = {
  getAll: (params?: { name?: string; status?: boolean; startDate?: string; endDate?: string }) =>
    api.get("/clients", { params }),
  getById: (id: number) => api.get(`/clients/${id}`),
  create: (data: { name: string; contact_info: string; status?: boolean }) =>
    api.post("/clients", data),
  update: (
    id: number,
    data: { name?: string; contact_info?: string; status?: boolean }
  ) => api.put(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
};

// Operaciones para Inventario (Inventory)
export const inventoryApi = {
  // Entradas de inventario
  getEntries: (params?: {
    supplierId?: number;
    eggTypeId?: number;
    startDate?: string;
    endDate?: string;
  }) => api.get("/inventory/entries", { params }),
  getEntryById: (id: number) => api.get(`/inventory/entries/${id}`),
  createEntry: (data: {
    supplierId: number;
    details: {
      eggTypeId: number;
      boxCount: number;
      weightTotal: number;
    }[];
  }) => api.post("/inventory/entries", data),
  updateEntry: (
    id: number,
    data: {
      entryDetails: {
        eggTypeId: number;
        boxCount: number;
        weightTotal: number;
      }[];
    }
  ) => api.put(`/inventory/entries/${id}`, data),
  deleteEntry: (id: number) => api.delete(`/inventory/entries/${id}`),

  // Stock
  getCurrentStock: () => api.get("/inventory/stock"),
  getStockByEggType: (id: number) => api.get(`/inventory/stock/${id}`),
  adjustStock: (data: { eggTypeId: number; quantity: number; reason: string }) =>
    api.post("/inventory/adjust-stock", data),

  // Movimientos
  getMovements: (params?: {
    eggTypeId?: number;
    startDate?: string;
    endDate?: string;
    movementType?: string;
  }) => api.get("/inventory/movements", { params }),
};

// Operaciones para Remisiones (Remissions)
export const remissionApi = {
  getAll: (params?: { clientId?: number; startDate?: string; endDate?: string }) =>
    api.get("/remissions", { params }),
  getById: (id: number) => api.get(`/remissions/${id}`),
  create: (data: { date: string; clientId: number; details: {
    eggTypeId: number;
    supplierId: number;
    boxCount: number;
    weights?: number[];
    weightTotal?: number;
    pricePerKilo: number;
  }[] }) => api.post("/remissions", data),
  update: (
    id: number,
    data: { date?: string; clientId?: number }
  ) => api.put(`/remissions/${id}`, data),
  delete: (id: number) => api.delete(`/remissions/${id}`),

  // Detalles de remisión
  createDetail: (data: {
    remissionId: number;
    eggTypeId: number;
    supplierId: number;
    boxCount: number;
    isByBox: boolean;
    weights?: number[];
    weightTotal?: number;
    pricePerKilo: number;
  }) => api.post("/remissions/details", data),
  getDetail: (id: number) => api.get(`/remissions/details/${id}`),
  updateDetail: (
    id: number,
    data: {
      boxCount?: number;
      isByBox?: boolean;
      weights?: number[];
      estimatedWeightPerBox?: number;
      pricePerKilo?: number;
    }
  ) => api.put(`/remissions/details/${id}`, data),
};

// Operaciones para Pagos (Payments)
export const paymentApi = {
  getAll: (params?: {
    clientId?: number;
    startDate?: string;
    endDate?: string;
    method?: string;
    minAmount?: number;
    maxAmount?: number;
  }) => api.get("/payments", { params }),
  getById: (id: number) => api.get(`/payments/${id}`),
  create: (data: {
    clientId: number;
    paymentDetails: {
      remissionId: number;
      amountAssigned: number;
    }[];
    method: string;
  }) => api.post("/payments", data),
  update: (
    id: number,
    data: { amount?: number; method?: string }
  ) => api.put(`/payments/${id}`, data),
  delete: (id: number) => api.delete(`/payments/${id}`),
};

export default api;