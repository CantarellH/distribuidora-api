import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token en las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Obtener todos los tipos de huevo con proveedores
export const getEggTypes = async () => {
  const response = await api.get("/types");
  return response.data;
};

// Crear un tipo de huevo con un proveedor asociado
export const createEggType = async (data: { name: string; description?: string; supplierId?: number }) => {
  const response = await api.post("/types", data);
  return response.data;
};

// Actualizar un tipo de huevo
export const updateEggType = async (
  id: number,
  data: { name: string; description?: string; supplierId?: number }
) => {
  const response = await api.put(`/types/${id}`, data);
  return response.data;
};


// Eliminar un tipo de huevo
export const deleteEggType = async (id: number) => {
  await api.delete(`/types/${id}`);
};

// Obtener los proveedores de un tipo de huevo
export const getSuppliersByEggType = async (eggTypeId: number) => {
  const response = await api.get(`/types/${eggTypeId}/suppliers`);
  return response.data;
};

// Obtener los tipos de huevo de un proveedor
// Endpoint más claro para tipos de huevo por proveedor
export const getEggTypesBySupplier = async (supplierId: number) => {
  try {
    const response = await api.get(`/types/${supplierId}/types`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getsuppliers = async () => {
  const response = await api.get("/suppliers");
  return response.data;
};

export const createSuppliers = async (data: { name: string; phone_number?: string; email?: string, address?: string }) => {
  const response = await api.post("/suppliers", data);
  return response.data;
};

export const updateSuppliers = async (
  id: number,
  data: { name: string; phone_number?: string; email?: string, address?: string  }
) => {
  const response = await api.put(`/suppliers/${id}`, data);
  return response.data;
};

export const deleteSupplier = async (id: number) => {
  await api.delete(`/suppliers/${id}`);
};

export const getClients = async () => {
  const response = await api.get("/clients");
  return response.data;
};

export const getClientById = async (id: number) => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};

// Crear un tipo de huevo con un proveedor asociado
export const createClient = async (data: { name: string; description?: string; supplierId?: number }) => {
  const response = await api.post("/clients", data);
  return response.data;
};

// Actualizar un tipo de huevo
export const updateClient = async (
  id: number,
  data: { name: string; description?: string; supplierId?: number }
) => {
  const response = await api.put(`/clients/${id}`, data);
  return response.data;
};


// Eliminar un tipo de huevo
export const deleteClient = async (id: number) => {
  await api.delete(`/clients/${id}`);
};

// Mejor manejo de errores
const handleApiError = (error: any) => {
  if (error.response) {
    throw new Error(error.response.data.message || 'Error en la solicitud');
  } else {
    throw new Error('Error de conexión con el servidor');
  }
};

export const getSuppliers = async () => {
  try {
    const response = await api.get("/suppliers");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getInventoryEntries = async (params?: {
  supplierId?: number;
  eggTypeId?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get("/inventory", { params });
  return response.data;
};

export const getInventoryEntryById = async (id: number) => {
  const response = await api.get(`/inventory/${id}`);
  return response.data;
};

export const createInventoryEntry = async (data: {
  supplierId: number;
  details: {
    eggTypeId: number;
    boxCount: number;
    weightTotal: number;
  }[];
}) => {
  const response = await api.post("/inventory", data);
  return response.data;
};

export const updateInventoryEntry = async (
  id: number,
  data: {
    supplierId: number;
    details: {
      eggTypeId: number;
      boxCount: number;
      weightTotal: number;
    }[];
  }
) => {
  const response = await api.put(`/inventory/${id}`, data);
  return response.data;
};

export const deleteInventoryEntry = async (id: number) => {
  await api.delete(`/inventory/${id}`);
};





export default api;
