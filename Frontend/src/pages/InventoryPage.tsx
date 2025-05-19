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
  Alert, 
  CircularProgress, 
  IconButton, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  useTheme,
  useMediaQuery,
  Grid,
  Chip,
  Tooltip
} from "@mui/material";
import { 
  KeyboardArrowDown, 
  KeyboardArrowUp, 
  Add, 
  Edit, 
  Delete, 
  Close,
  CheckCircle,
  Cancel
} from "@mui/icons-material";
import { inventoryApi, supplierApi, eggTypeApi } from "../api/api";
import DashboardLayout from "../components/DashboardLayout";

interface EggType {
  id: number;
  name: string;
  description?: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface InventoryEntryDetail {
  id: number;
  eggType: EggType;
  boxCount: number;
  weightTotal: number;
  pricePerKilo: number;
}

interface InventoryEntry {
  id: number;
  createdAt: string;
  supplier: Supplier;
  details: InventoryEntryDetail[];
  status: 'pending' | 'verified' | 'rejected';
}

const InventoryPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState({
    page: true,
    action: false,
    suppliers: false,
    eggTypes: false
  });
  const [error, setError] = useState<string | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<InventoryEntry | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [eggTypes, setEggTypes] = useState<EggType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    supplierId: "",
    details: [{
      eggTypeId: "",
      boxCount: "",
      weightTotal: "",
      pricePerKilo: ""
    }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(prev => ({ ...prev, page: true }));
      setError(null);
      
      const [entriesRes, suppliersRes] = await Promise.all([
        inventoryApi.getEntries(),
        supplierApi.getAll()
      ]);
      
      // Añadir comprobación de undefined
      if (!entriesRes || !suppliersRes) {
        throw new Error("No se recibieron datos del servidor");
      }
      
      setEntries(entriesRes.data);
      setSuppliers(suppliersRes.data);
      
      const eggTypesRes = await eggTypeApi.getAll();
      if (!eggTypesRes) {
        throw new Error("No se recibieron tipos de huevo del servidor");
      }
      setEggTypes(eggTypesRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos. Intente nuevamente.");
    } finally {
      setLoading(prev => ({ ...prev, page: false }));
    }
  };


  const filteredEntries = entries.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.supplier.name.toLowerCase().includes(searchLower) ||
      entry.id.toString().includes(searchLower) ||
      entry.details.some(d => 
        d.eggType.name.toLowerCase().includes(searchLower)
      )
    );
  });

  const toggleEntryExpansion = (id: number) => {
    setExpandedEntries(prev => 
      prev.includes(id) ? prev.filter(entryId => entryId !== id) : [...prev, id]
    );
  };

  const handleOpenDialog = (entry: InventoryEntry | null) => {
    setCurrentEntry(entry);
    
    if (entry) {
      setFormData({
        supplierId: entry.supplier.id.toString(),
        details: entry.details.map(detail => ({
          eggTypeId: detail.eggType.id.toString(),
          boxCount: detail.boxCount.toString(),
          weightTotal: detail.weightTotal.toString(),
          pricePerKilo: detail.pricePerKilo.toString()
        }))
      });
    } else {
      setFormData({
        supplierId: "",
        details: [{
          eggTypeId: "",
          boxCount: "",
          weightTotal: "",
          pricePerKilo: ""
        }]
      });
    }
    
    setDialogOpen(true);
  };

  const handleStatusChange = async (id: number, newStatus: 'verified' | 'rejected') => {
  try {
    setLoading(prev => ({ ...prev, action: true }));
    await inventoryApi.updateEntry(id, { status: newStatus });
    await fetchData();
  } catch (err) {
    console.error("Error updating status:", err);
    setError("Error al actualizar el estado");
  } finally {
    setLoading(prev => ({ ...prev, action: false }));
  }
};


  const handleAddDetail = () => {
    setFormData({
      ...formData,
      details: [
        ...formData.details,
        {
          eggTypeId: "",
          boxCount: "",
          weightTotal: "",
          pricePerKilo: ""
        }
      ]
    });
  };

  const handleRemoveDetail = (index: number) => {
    const newDetails = [...formData.details];
    newDetails.splice(index, 1);
    setFormData({
      ...formData,
      details: newDetails
    });
  };

  const handleDetailChange = (
    index: number,
    field: keyof typeof formData.details[0],
    value: string
  ) => {
    const newDetails = [...formData.details];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value
    };
    setFormData({
      ...formData,
      details: newDetails
    });
  };

  const validateForm = () => {
    if (!formData.supplierId) return false;
    
    for (const detail of formData.details) {
      if (
        !detail.eggTypeId ||
        !detail.boxCount ||
        !detail.weightTotal ||
        !detail.pricePerKilo
      ) {
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      setError("Por favor complete todos los campos requeridos");
      return;
    }
    
    setLoading(prev => ({ ...prev, action: true }));
    
    // Ajustar el payload según lo que espera tu API
    const payload = {
      // Si tu API espera entryDetails en lugar de details
      entryDetails: formData.details.map(detail => ({
        eggTypeId: parseInt(detail.eggTypeId),
        boxCount: parseInt(detail.boxCount),
        weightTotal: parseFloat(detail.weightTotal),
        // Si pricePerKilo no es parte de lo que espera la API, quitarlo
        ...(inventoryApi.createEntry.length > 1 && { pricePerKilo: parseFloat(detail.pricePerKilo) })
      })),
      // Si tu API espera supplierId en el nivel superior
      ...(inventoryApi.createEntry.length > 1 && { supplierId: parseInt(formData.supplierId) })
    };
    
    if (currentEntry) {
      await inventoryApi.updateEntry(currentEntry.id, payload);
    } else {
      await inventoryApi.createEntry(payload);
    }
    
    await fetchData();
    setDialogOpen(false);
  } catch (err) {
    console.error("Error submitting form:", err);
    setError("Error al guardar los datos. Intente nuevamente.");
  } finally {
    setLoading(prev => ({ ...prev, action: false }));
  }
};


  const handleDelete = async (id: number) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      await inventoryApi.deleteEntry(id);
      await fetchData();
    } catch (err) {
      console.error("Error deleting entry:", err);
      setError("Error al eliminar la entrada");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };


  
  if (loading.page) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: isMobile ? 1 : 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: 3,
          gap: isMobile ? 2 : 0
        }}>
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
            Gestión de Inventario
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, width: isMobile ? '100%' : 'auto' }}>
            <TextField
              label="Buscar"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth={isMobile}
            />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={!isMobile && <Add />}
              onClick={() => handleOpenDialog(null)}
              disabled={loading.action}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? <Add /> : 'Nueva Entrada'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell width="50px" />
                {!isMobile && <TableCell>ID</TableCell>}
                <TableCell>Proveedor</TableCell>
                {!isMobile && <TableCell>Fecha</TableCell>}
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.map(entry => (
                <React.Fragment key={entry.id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton 
                        size="small"
                        onClick={() => toggleEntryExpansion(entry.id)}
                      >
                        {expandedEntries.includes(entry.id) ? 
                          <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>
                    {!isMobile && <TableCell>{entry.id}</TableCell>}
                    <TableCell>
                      <Tooltip title={entry.supplier.name}>
                        <span style={{
                          display: 'inline-block',
                          width: isMobile ? 100 : 150,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {entry.supplier.name}
                        </span>
                      </Tooltip>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </TableCell>
                    )}
                    <TableCell>
                      {entry.status === 'verified' ? (
                        <Chip
                          icon={<CheckCircle fontSize="small" />}
                          label={isMobile ? "" : "Verificado"}
                          color="success"
                          size="small"
                        />
                      ) : entry.status === 'rejected' ? (
                        <Chip
                          icon={<Cancel fontSize="small" />}
                          label={isMobile ? "" : "Rechazado"}
                          color="error"
                          size="small"
                        />
                      ) : (
                        <Chip
                          label={isMobile ? "" : "Pendiente"}
                          color="warning"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(entry)}
                          disabled={loading.action}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(entry.id)}
                          disabled={loading.action}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0 }}>
                      <Collapse in={expandedEntries.includes(entry.id)}>
                        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Detalles de la Entrada
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Tipo de Huevo</TableCell>
                                <TableCell align="right">Cajas</TableCell>
                                <TableCell align="right">Peso (kg)</TableCell>
                                <TableCell align="right">Precio/kg</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {entry.details.map((detail, index) => (
                                <TableRow key={index}>
                                  <TableCell>{detail.eggType.name}</TableCell>
                                  <TableCell align="right">{detail.boxCount}</TableCell>
                                  <TableCell align="right">{detail.weightTotal}</TableCell>
                                  <TableCell align="right">${detail.pricePerKilo.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          
                          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button
                              variant="outlined"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleStatusChange(entry.id, 'verified')}
                              disabled={loading.action}
                              size="small"
                            >
                              Marcar como Verificado
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => handleStatusChange(entry.id, 'rejected')}
                              disabled={loading.action}
                              size="small"
                            >
                              Rechazar Entrada
                            </Button>
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Diálogo para crear/editar */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          fullWidth
          maxWidth="md"
          fullScreen={isMobile}
        >
          <DialogTitle>
            {currentEntry ? `Editar Entrada #${currentEntry.id}` : 'Nueva Entrada de Inventario'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Proveedor</InputLabel>
                  <Select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                    label="Proveedor"
                    disabled={loading.action}
                  >
                    {suppliers.map(supplier => (
                      <MenuItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
              Detalles de la Entrada
            </Typography>
            
            {formData.details.map((detail, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Huevo</InputLabel>
                    <Select
                      value={detail.eggTypeId}
                      onChange={(e) => handleDetailChange(index, 'eggTypeId', e.target.value)}
                      label="Tipo de Huevo"
                      disabled={loading.action}
                    >
                      {eggTypes.map(type => (
                        <MenuItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} md={2}>
                  <TextField
                    label="Cajas"
                    type="number"
                    value={detail.boxCount}
                    onChange={(e) => handleDetailChange(index, 'boxCount', e.target.value)}
                    fullWidth
                    disabled={loading.action}
                  />
                </Grid>
                
                <Grid item xs={6} md={2}>
                  <TextField
                    label="Peso (kg)"
                    type="number"
                    value={detail.weightTotal}
                    onChange={(e) => handleDetailChange(index, 'weightTotal', e.target.value)}
                    fullWidth
                    disabled={loading.action}
                  />
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <TextField
                    label="Precio por Kilo"
                    type="number"
                    value={detail.pricePerKilo}
                    onChange={(e) => handleDetailChange(index, 'pricePerKilo', e.target.value)}
                    fullWidth
                    disabled={loading.action}
                    InputProps={{
                      startAdornment: '$'
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  {formData.details.length > 1 && (
                    <IconButton 
                      onClick={() => handleRemoveDetail(index)}
                      disabled={loading.action}
                      color="error"
                    >
                      <Close />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}
            
            <Button
              onClick={handleAddDetail}
              startIcon={<Add />}
              disabled={loading.action || !formData.supplierId}
              sx={{ mt: 1 }}
            >
              Agregar Detalle
            </Button>
          </DialogContent>
          
          <DialogActions>
            <Button 
              onClick={() => setDialogOpen(false)}
              disabled={loading.action}
              size={isMobile ? "small" : "medium"}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={loading.action}
              startIcon={loading.action ? <CircularProgress size={20} /> : null}
              size={isMobile ? "small" : "medium"}
            >
              {currentEntry ? "Actualizar" : "Guardar"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default InventoryPage;