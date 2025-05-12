import React, { useEffect, useState } from "react";
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
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Box,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import DashboardLayout from "../components/DashboardLayout";
import { eggTypeApi, supplierApi } from "../api/api";

interface Supplier {
  id: number;
  name: string;
}

interface EggTypeSupplier {
  id: number;
  supplier: Supplier;
}

interface EggType {
  id: number;
  name: string;
  claveSat: string;
  unidadSat: string;
  claveUnidadSat: string;
  description: string;
  eggTypeSuppliers: EggTypeSupplier[];
}

const EggTypesPage: React.FC = () => {
  const [eggTypes, setEggTypes] = useState<EggType[]>([]);
  const [loading, setLoading] = useState({
    list: true,
    action: false,
    suppliers: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEggType, setCurrentEggType] = useState<EggType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    supplierId: undefined as number | undefined,
    claveSat: "", // Nuevo campo requerido
    unidadSat: "",
    claveUnidadSat: "" // Nuevo campo requerido
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    fetchEggTypes();
    fetchSuppliers();
  }, []);

  const fetchEggTypes = async () => {
  try {
    setLoading((prev) => ({ ...prev, list: true }));
    setError(null);
    const response = await eggTypeApi.getAll();
    if (response && response.data) {
      setEggTypes(response.data);
    }
  } catch (err: unknown) {
    console.error("Error fetching egg types:", err);
    setError(
      err instanceof Error
        ? err.message
        : "Error al cargar los tipos de huevo"
    );
  } finally {
    setLoading((prev) => ({ ...prev, list: false }));
  }
};

const fetchSuppliers = async () => {
  try {
    setLoading((prev) => ({ ...prev, suppliers: true }));
    const response = await supplierApi.getAll();
    if (response && response.data) {
      setSuppliers(response.data);
    }
  } catch (err: unknown) {
    console.error("Error fetching suppliers:", err);
  } finally {
    setLoading((prev) => ({ ...prev, suppliers: false }));
  }
};

  const handleOpenDialog = (eggType: EggType | null) => {
  setCurrentEggType(eggType);
  if (eggType) {
    const primarySupplier = eggType.eggTypeSuppliers[0]?.supplier;
    setFormData({
      name: eggType.name,
      description: eggType.description || "",
      supplierId: primarySupplier?.id,
      claveSat: eggType.claveSat || "", // Asegurar que existe en el tipo EggType
      unidadSat: eggType.unidadSat || "",
      claveUnidadSat: eggType.claveUnidadSat || ""
    });
  } else {
    setFormData({
      name: "",
      description: "",
      supplierId: undefined,
      claveSat: "",
      unidadSat: "",
      claveUnidadSat: ""
    });
  }
  setOpenDialog(true);
};

  const handleSubmit = async () => {
  if (!formData.name || !formData.claveSat) { // Validar campos requeridos
    setError("Nombre y Clave SAT son requeridos");
    return;
  }

  try {
    setLoading((prev) => ({ ...prev, action: true }));
    setError(null);

    const payload = {
      name: formData.name,
      description: formData.description,
      supplierId: formData.supplierId,
      claveSat: formData.claveSat,
      unidadSat: formData.unidadSat,
      claveUnidadSat: formData.claveUnidadSat
    };

    if (currentEggType) {
      await eggTypeApi.update(currentEggType.id, payload);
    } else {
      await eggTypeApi.create(payload);
    }

    await fetchEggTypes();
    setOpenDialog(false);
  } catch (err: unknown) {
    console.error("Error saving egg type:", err);
    setError(
      err instanceof Error ? err.message : "Error al guardar el tipo de huevo"
    );
  } finally {
    setLoading((prev) => ({ ...prev, action: false }));
  }
};

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar este tipo de huevo?")) return;

    try {
      setLoading((prev) => ({ ...prev, action: true }));
      await eggTypeApi.delete(id);
      await fetchEggTypes();
    } catch (err: unknown) {
      console.error("Error deleting egg type:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar el tipo de huevo"
      );
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Catálogo de Tipos de Huevo
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog(null)}
            disabled={loading.list || loading.suppliers}
          >
            Nuevo Tipo
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading.list ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
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
                      <Tooltip title={eggType.description || "Sin descripción"}>
                        <span>
                          {eggType.description
                            ? eggType.description.length > 30
                              ? `${eggType.description.substring(0, 30)}...`
                              : eggType.description
                            : "-"}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {eggType.eggTypeSuppliers.map((ets) => (
                        <Chip
                          key={ets.id}
                          label={ets.supplier.name}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton
                          onClick={() => handleOpenDialog(eggType)}
                          color="primary"
                          disabled={loading.action}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          onClick={() => handleDelete(eggType.id)}
                          color="error"
                          disabled={loading.action}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {currentEggType ? "Editar Tipo de Huevo" : "Nuevo Tipo de Huevo"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Nombre"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={loading.action}
            />
            <TextField
              label="Clave SAT"
              fullWidth
              margin="normal"
              value={formData.claveSat}
              onChange={(e) =>
                setFormData({ ...formData, claveSat: e.target.value })
              }
              required
              disabled={loading.action}
            />
            <TextField
              label="Unidad SAT"
              fullWidth
              margin="normal"
              value={formData.unidadSat}
              onChange={(e) =>
                setFormData({ ...formData, unidadSat: e.target.value })
              }
              required
              disabled={loading.action}
            />
            <TextField
              label="Clave Unidad SAT"
              fullWidth
              margin="normal"
              value={formData.claveUnidadSat}
              onChange={(e) =>
                setFormData({ ...formData, claveUnidadSat: e.target.value })
              }
              required
              disabled={loading.action}
            />
            <TextField
              label="Descripción"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={loading.action}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Proveedor</InputLabel>
              <Select
                value={formData.supplierId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supplierId: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                label="Proveedor"
                disabled={loading.action || loading.suppliers}
              >
                <MenuItem value="">
                  <em>Ninguno</em>
                </MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenDialog(false)}
              disabled={loading.action}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              disabled={loading.action}
              startIcon={loading.action ? <CircularProgress size={20} /> : null}
            >
              {currentEggType ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default EggTypesPage;
