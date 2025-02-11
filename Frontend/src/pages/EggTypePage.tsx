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
  getEggTypes,
  createEggType,
  updateEggType,
  deleteEggType,
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
interface EggType {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  eggTypeSuppliers?: { id: number; supplier: Supplier }[];
  suppliers?: Supplier[]; // ✅ Agregamos el campo suppliers para que TypeScript lo reconozca
}

const EggTypePage: React.FC = () => {
  const [eggTypes, setEggTypes] = useState<EggType[]>([]);
  const [selectedEggType, setSelectedEggType] = useState<EggType | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    supplierId: '',
  });
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchEggTypes();
    fetchSuppliers(); // Cargar proveedores disponibles
  }, []);

  const fetchEggTypes = async () => {
    try {
      const data: EggType[] = await getEggTypes(); // Ahora especificamos el tipo
      const processedEggTypes = data.map((eggType: EggType) => ({
        ...eggType,
        suppliers: eggType.eggTypeSuppliers?.map((ets) => ets.supplier) || [],
      }));
      setEggTypes(processedEggTypes);
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

  const handleOpenDialog = (eggType?: EggType) => {
    if (eggType) {
      setSelectedEggType(eggType);
      setForm({
        name: eggType.name,
        description: eggType.description || "",
        supplierId: "",
      });
    } else {
      setSelectedEggType(null);
      setForm({ name: "", description: "", supplierId: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      if (selectedEggType) {
        // Editar tipo de huevo
        const payload = {
          name: form.name,
          description: form.description,
          supplierId: form.supplierId ? parseInt(form.supplierId, 10) : undefined,
        };
        await updateEggType(selectedEggType.id, payload);
      } else {
        // Crear tipo de huevo
        const payload = {
          name: form.name,
          description: form.description,
          supplierId: form.supplierId ? parseInt(form.supplierId, 10) : undefined,
        };
        await createEggType(payload);
      }
  
      // 🔄 Volvemos a llamar a fetchEggTypes para recargar los datos de la tabla
      await fetchEggTypes();
  
      // Cerramos el modal
      handleCloseDialog();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };
  

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Seguro que quieres eliminar este tipo de huevo?")) {
      try {
        await deleteEggType(id);

        // ✅ Eliminamos solo el elemento afectado en la tabla sin recargar todo
        setEggTypes((prevEggTypes) => prevEggTypes.filter((et) => et.id !== id));
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <DashboardLayout>
      <Typography variant="h4" gutterBottom>
        Catálogo de Tipos de Huevo
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenDialog()}
      >
        Agregar Tipo de Huevo
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
            {eggTypes.map((eggType) => (
              <TableRow key={eggType.id}>
                <TableCell>{eggType.id}</TableCell>
                <TableCell>{eggType.name}</TableCell>
                <TableCell>
                  {eggType.description || "Sin descripción"}
                </TableCell>
                <TableCell>
                  {eggType.suppliers && eggType.suppliers.length > 0
                    ? eggType.suppliers
                        .map((supplier) => supplier.name)
                        .join(", ")
                    : "Sin proveedores"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenDialog(eggType)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(eggType.id)}
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
          {selectedEggType ? "Editar Tipo de Huevo" : "Agregar Tipo de Huevo"}
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
            {selectedEggType ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default EggTypePage;