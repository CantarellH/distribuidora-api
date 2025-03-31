import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  getsuppliers,
  createSuppliers,
  updateSuppliers,
  deleteSuppliers,
} from "../api/api"; // Importa las funciones necesarias
import api from "../api/api";

// Define la interfaz para los proveedores
interface Supplier {
  id: number;
  name: string;
  contact_info?: string;
  createdAt: string;
  updatedAt: string;
}

// Define la interfaz para los tipos de huevo
interface Suppliers {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  suppliersSuppliers?: { id: number; supplier: Supplier }[];
  suppliers?: Supplier[]; // ✅ Agregamos el campo suppliers para que TypeScript lo reconozca
}

const SuppliersPage: React.FC = () => {
  const [supplierss, setSupplierss] = useState<Suppliers[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Suppliers | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    supplierId: '',
  });
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchSupplierss();
    fetchSuppliers(); // Cargar proveedores disponibles
  }, []);

  const fetchSupplierss = async () => {
    try {
      const data: Suppliers[] = await getsuppliers(); // Ahora especificamos el tipo
      const processedSupplierss = data.map((suppliers: Suppliers) => ({
        ...suppliers,
        suppliers: suppliers.suppliersSuppliers?.map((ets) => ets.supplier) || [],
      }));
      setSupplierss(processedSupplierss);
    } catch (error) {
      console.error("Error obteniendo los tipos de huevo:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get<Supplier[]>("/suppliers"); // Definimos el tipo para la respuesta
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error obteniendo proveedores:", error);
    }
  };

  const handleOpenDialog = (suppliers?: Suppliers) => {
    if (suppliers) {
      setSelectedSuppliers(suppliers);
      setForm({
        name: suppliers.name,
        description: suppliers.description || "",
        supplierId: "",
      });
    } else {
      setSelectedSuppliers(null);
      setForm({ name: "", description: "", supplierId: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      if (selectedSuppliers) {
        // Editar tipo de huevo
        const payload = {
          name: form.name,
          description: form.description,
          supplierId: form.supplierId ? parseInt(form.supplierId, 10) : undefined,
        };
        await updateSuppliers(selectedSuppliers.id, payload);
      } else {
        // Crear tipo de huevo
        const payload = {
          name: form.name,
          description: form.description,
          supplierId: form.supplierId ? parseInt(form.supplierId, 10) : undefined,
        };
        await createSuppliers(payload);
      }
  
      // 🔄 Volvemos a llamar a fetchSupplierss para recargar los datos de la tabla
      await fetchSupplierss();
  
      // Cerramos el modal
      handleCloseDialog();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };
  

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Seguro que quieres eliminar este tipo de huevo?")) {
      try {
        await deleteSuppliers(id);

        // ✅ Eliminamos solo el elemento afectado en la tabla sin recargar todo
        setSupplierss((prevSupplierss) => prevSupplierss.filter((et) => et.id !== id));
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <DashboardLayout>
      <Typography variant="h4" gutterBottom>
        Catálogo de Proveedores
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenDialog()}
      >
        Agregar Proveedor
      </Button>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Proveedores</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {supplierss.map((suppliers) => (
              <TableRow key={suppliers.id}>
                <TableCell>{suppliers.id}</TableCell>
                <TableCell>{suppliers.name}</TableCell>
                <TableCell>
                  {suppliers.description || "Sin descripción"}
                </TableCell>
                <TableCell>
                  {suppliers.suppliers && suppliers.suppliers.length > 0
                    ? suppliers.suppliers
                        .map((supplier) => supplier.name)
                        .join(", ")
                    : "Sin proveedores"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenDialog(suppliers)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(suppliers.id)}
                    sx={{ ml: 1 }}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para agregar/editar tipos de huevo */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedSuppliers ? "Editar Tipo de Huevo" : "Agregar Tipo de Huevo"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            fullWidth
            variant="outlined"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mt: 2 }}
            required
          />
          <TextField
            label="Descripción"
            fullWidth
            variant="outlined"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Proveedor</InputLabel>
            <Select
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            >
              <MenuItem value="">Sin proveedor</MenuItem>
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {selectedSuppliers ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default SuppliersPage;