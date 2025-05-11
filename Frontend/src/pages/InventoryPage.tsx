import React, { useEffect, useState } from "react"; // Added React import
import { inventoryApi, supplierApi, eggTypeApi } from "../api/api"; 
import { useLocation } from "react-router-dom"; 
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
  Box,
  IconButton,
  Collapse,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Add,
  Edit,
  Delete,
  Close,
} from "@mui/icons-material";

interface EggType {
  id: number;
  name: string;
  description?: string;
}

interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
}

interface InventoryEntryDetail {
  id: number;
  eggType: EggType;
  boxCount: number;
  weightTotal: number;
}

interface InventoryEntry {
  id: number;
  createdAt: string;
  updatedAt: string;
  supplier: Supplier;
  details: InventoryEntryDetail[];
}

const InventoryPage: React.FC = () => {
  const location = useLocation();
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [filteredEggTypes, setFilteredEggTypes] = useState<EggType[]>([]);
  const [loadingEggTypes, setLoadingEggTypes] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<InventoryEntry | null>(null);
  const [formData, setFormData] = useState({
    supplierId: "",
    details: [{ eggTypeId: "", boxCount: "", weightTotal: "" }],
  });

   
  useEffect(() => {
    
  }, [location.pathname]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryData, suppliersData] = await Promise.all([
        inventoryApi.getAll(),
        supplierApi.getAll(),
      ]);
      setEntries(inventoryData);
      setSuppliers(suppliersData);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>

      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const fetchEggTypesBySupplier = async (supplierId: number) => {
    try {
      setLoadingEggTypes(true);
      const data = await eggTypeApi.getBySupplier(supplierId);
      setFilteredEggTypes(data);
    } catch (err) {
      console.error("Error al obtener tipos de huevo:", err);
      setFilteredEggTypes([]);
    } finally {
      setLoadingEggTypes(false);
    }
  };

  const handleOpenDialog = (entry: InventoryEntry | null) => {
    setCurrentEntry(entry);
    if (entry) {
      setFormData({
        supplierId: entry.supplier.id.toString(),
        details: entry.details.map((detail) => ({
          eggTypeId: detail.eggType.id.toString(),
          boxCount: detail.boxCount.toString(),
          weightTotal: detail.weightTotal.toString(),
        })),
      });
      fetchEggTypesBySupplier(entry.supplier.id);
    } else {
      setFormData({
        supplierId: "",
        details: [{ eggTypeId: "", boxCount: "", weightTotal: "" }],
      });
      setFilteredEggTypes([]);
    }
    setOpenDialog(true);
  };

  const handleAddDetail = () => {
    setFormData({
      ...formData,
      details: [
        ...formData.details,
        { eggTypeId: "", boxCount: "", weightTotal: "" },
      ],
    });
  };

  const handleRemoveDetail = (index: number) => {
    const newDetails = [...formData.details];
    newDetails.splice(index, 1);
    setFormData({ ...formData, details: newDetails });
  };

  const handleDetailChange = (index: number, field: string, value: string) => {
    const newDetails = [...formData.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setFormData({ ...formData, details: newDetails });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        supplierId: Number(formData.supplierId),
        details: formData.details.map((detail) => ({
          eggTypeId: Number(detail.eggTypeId),
          boxCount: Number(detail.boxCount),
          weightTotal: Number(detail.weightTotal),
        })),
      };

      if (currentEntry) {
        await inventoryApi.update(currentEntry.id, payload);
      } else {
        await inventoryApi.create(payload);
      }
      await fetchData();
      setOpenDialog(false);
    } catch (err) {
      setError("Error al guardar la entrada");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar esta entrada?")) {
      try {
        await inventoryApi.delete(id);
        await fetchData();
      } catch (err) {
        setError("Error al eliminar la entrada");
        console.error(err);
      }
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    const newDetails = formData.details.map(detail => ({
      ...detail,
      eggTypeId: ""
    }));
    
    setFormData({
      ...formData,
      supplierId,
      details: newDetails
    });
    
    if (supplierId) {
      fetchEggTypesBySupplier(Number(supplierId));
    } else {
      setFilteredEggTypes([]);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <DashboardLayout>
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => handleOpenDialog(null)}
        sx={{ mb: 2 }}
      >
        Nueva Entrada
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <React.Fragment key={entry.id}>
                <TableRow>
                  <TableCell>
                    <IconButton onClick={() => toggleRow(entry.id)}>
                      {expandedRows.includes(entry.id) ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{entry.id}</TableCell>
                  <TableCell>{entry.supplier.name}</TableCell>
                  <TableCell>
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(entry)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(entry.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} style={{ padding: 0 }}>
                    <Collapse in={expandedRows.includes(entry.id)}>
                      <Box sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Detalles de la entrada
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Tipo de Huevo</TableCell>
                              <TableCell>Cajas</TableCell>
                              <TableCell>Peso Total (kg)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {entry.details.map((detail, index) => (
                              <TableRow key={index}>
                                <TableCell>{detail.eggType.name}</TableCell>
                                <TableCell>{detail.boxCount}</TableCell>
                                <TableCell>{detail.weightTotal}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md">
        <DialogTitle>
          {currentEntry ? "Editar Entrada" : "Nueva Entrada"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Proveedor</InputLabel>
            <Select
              value={formData.supplierId}
              onChange={(e) => handleSupplierChange(e.target.value)}
              label="Proveedor"
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Detalles
          </Typography>
          {formData.details.map((detail, index) => (
            <Box key={index} sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Huevo</InputLabel>
                <Select
                  value={detail.eggTypeId}
                  onChange={(e) =>
                    handleDetailChange(index, "eggTypeId", e.target.value)
                  }
                  label="Tipo de Huevo"
                  disabled={!formData.supplierId || loadingEggTypes}
                >
                  {loadingEggTypes ? (
                    <MenuItem disabled>Cargando tipos...</MenuItem>
                  ) : filteredEggTypes.length === 0 ? (
                    <MenuItem disabled value="">
                      {formData.supplierId 
                        ? "Este proveedor no tiene tipos registrados" 
                        : "Seleccione un proveedor primero"}
                    </MenuItem>
                  ) : (
                    filteredEggTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <TextField
                label="Cajas"
                type="number"
                value={detail.boxCount}
                onChange={(e) =>
                  handleDetailChange(index, "boxCount", e.target.value)
                }
                fullWidth
                disabled={!detail.eggTypeId}
              />

              <TextField
                label="Peso Total (kg)"
                type="number"
                value={detail.weightTotal}
                onChange={(e) =>
                  handleDetailChange(index, "weightTotal", e.target.value)
                }
                fullWidth
                disabled={!detail.eggTypeId}
              />

              {formData.details.length > 1 && (
                <IconButton onClick={() => handleRemoveDetail(index)}>
                  <Close />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            onClick={handleAddDetail}
            startIcon={<Add />}
            sx={{ mt: 2 }}
            disabled={!formData.supplierId}
          >
            Agregar Detalle
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.supplierId || formData.details.some(d => !d.eggTypeId || !d.boxCount || !d.weightTotal)}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default InventoryPage;