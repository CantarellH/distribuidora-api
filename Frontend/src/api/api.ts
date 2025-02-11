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
export const getEggTypesBySupplier = async (supplierId: number) => {
  const response = await api.get(`/types/${supplierId}/types`);
  return response.data;
};


export default api;
