import { useEffect, useState } from "react";
import { 
  getClients, 
  getClientById, 
  createClient, 
  updateClient, 
  deleteClient 
} from "../api/api";
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
  IconButton,
  Switch,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  FormControlLabel,
  useMediaQuery,
  useTheme,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, parseISO } from "date-fns";

interface Client {
  id: number;
  name: string;
  email?: string;
  supplierId?: number;
  status: boolean;
  created_at: string;
}

const ClientsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [clients, setClients] = useState<Client[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    name: "",
    description: "",
    supplierId: undefined as number | undefined,
    status: true
  });
  const [loading, setLoading] = useState({
    clients: false,
    action: false
  });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "all">("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(prev => ({ ...prev, clients: true }));
      setError(null);
      
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Error al cargar los clientes. Por favor, intente nuevamente.");
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  const handleCreateClient = async () => {
    if (!newClient.name) {
      setError("El nombre es requerido");
      return;
    }

    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      await createClient({
        name: newClient.name,
        description: newClient.description,
        supplierId: newClient.supplierId
      });
      setOpenCreateDialog(false);
      setNewClient({ name: "", description: "", supplierId: undefined, status: true });
      await fetchClients();
    } catch (err) {
      console.error("Error creating client:", err);
      setError(err.response?.data?.message || "Error al crear el cliente");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      await updateClient(selectedClient.id, {
        name: selectedClient.name,
        description: selectedClient.description,
        supplierId: selectedClient.supplierId
      });
      setOpenEditDialog(false);
      await fetchClients();
    } catch (err) {
      console.error("Error updating client:", err);
      setError(err.response?.data?.message || "Error al actualizar el cliente");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar este cliente?")) return;

    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      await deleteClient(id);
      await fetchClients();
    } catch (err) {
      console.error("Error deleting client:", err);
      setError("Error al eliminar el cliente");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleOpenEditDialog = async (client: Client) => {
    try {
      const fullClient = await getClientById(client.id);
      setSelectedClient(fullClient);
      setOpenEditDialog(true);
    } catch (err) {
      console.error("Error fetching client details:", err);
      setError("Error al cargar los detalles del cliente");
    }
  };

  const applyFilters = () => {
    fetchClients();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStartDate(null);
    setEndDate(null);
    fetchClients();
    setShowFilters(false);
  };

  const filteredClients = clients.filter(client => {
    // Filtro por nombre
    const nameMatch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por estado
    const statusMatch = statusFilter === "all" || client.status === statusFilter;
    
    // Filtro por fecha
    let dateMatch = true;
    if (startDate && endDate) {
      const clientDate = new Date(client.created_at);
      dateMatch = clientDate >= startDate && clientDate <= endDate;
    }
    
    return nameMatch && statusMatch && dateMatch;
  });

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
            Gestión de Clientes
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? '' : 'Filtros'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={!isMobile && <AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              disabled={loading.clients}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? <AddIcon /> : 'Nuevo Cliente'}
            </Button>
          </Box>
        </Box>

        {showFilters && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Buscar por nombre"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as boolean | "all")}
                    label="Estado"
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value={true}>Activos</MenuItem>
                    <MenuItem value={false}>Inactivos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha inicial"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{
                    textField: {
                      size: isMobile ? "small" : "medium",
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha final"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{
                    textField: {
                      size: isMobile ? "small" : "medium",
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={resetFilters}>
                  Limpiar
                </Button>
                <Button variant="contained" onClick={applyFilters}>
                  Aplicar
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading.clients ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table size={isMobile ? "small" : "medium"} aria-label="clients table">
              <TableHead>
                <TableRow>
                  {!isMobile && <TableCell>ID</TableCell>}
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  {!isMobile && <TableCell>Proveedor ID</TableCell>}
                  {!isMobile && <TableCell>Fecha Registro</TableCell>}
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} hover>
                    {!isMobile && <TableCell>{client.id}</TableCell>}
                    <TableCell>{client.name}</TableCell>
                    <TableCell>
                      <Tooltip title={client.description || 'Sin descripción'}>
                        <span style={{
                          display: 'inline-block',
                          width: isMobile ? 100 : 150,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {client.email || 'N/A'}
                        </span>
                      </Tooltip>
                    </TableCell>
                    {!isMobile && <TableCell>{client.supplierId || 'N/A'}</TableCell>}
                    {!isMobile && (
                      <TableCell>
                        {client.created_at ? format(parseISO(client.created_at), 'dd/MM/yyyy') : 'N/A'}
                      </TableCell>
                    )}
                    <TableCell>
                      {client.status ? (
                        <Chip
                          icon={<CheckCircleIcon fontSize="small" />}
                          label={isMobile ? "" : "Activo"}
                          color="success"
                          size={isMobile ? "small" : "medium"}
                        />
                      ) : (
                        <Chip
                          icon={<CancelIcon fontSize="small" />}
                          label={isMobile ? "" : "Inactivo"}
                          color="error"
                          size={isMobile ? "small" : "medium"}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(client)}
                          disabled={loading.action}
                          size={isMobile ? "small" : "medium"}
                        >
                          <EditIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Eliminar">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClient(client.id)}
                          disabled={loading.action}
                          size={isMobile ? "small" : "medium"}
                        >
                          <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Diálogo para crear cliente */}
        <Dialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          fullWidth
          maxWidth={isMobile ? "xs" : "sm"}
          fullScreen={isMobile}
        >
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre completo"
              fullWidth
              variant="outlined"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              disabled={loading.action}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
              required
            />
            
            <TextField
              margin="dense"
              label="Descripción"
              fullWidth
              variant="outlined"
              value={newClient.description}
              onChange={(e) => setNewClient({ ...newClient, description: e.target.value })}
              disabled={loading.action}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
              multiline
              rows={3}
            />
            
            <TextField
              margin="dense"
              label="ID de Proveedor"
              type="number"
              fullWidth
              variant="outlined"
              value={newClient.supplierId || ''}
              onChange={(e) => setNewClient({ 
                ...newClient, 
                supplierId: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              disabled={loading.action}
              size={isMobile ? "small" : "medium"}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={newClient.status}
                  onChange={(e) => setNewClient({ ...newClient, status: e.target.checked })}
                  color="primary"
                />
              }
              label="Cliente activo"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenCreateDialog(false)}
              disabled={loading.action}
              size={isMobile ? "small" : "medium"}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateClient}
              color="primary"
              variant="contained"
              disabled={loading.action}
              startIcon={loading.action ? <CircularProgress size={20} /> : null}
              size={isMobile ? "small" : "medium"}
            >
              {loading.action ? 'Creando...' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo para editar cliente */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          fullWidth
          maxWidth={isMobile ? "xs" : "sm"}
          fullScreen={isMobile}
        >
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogContent>
            {selectedClient && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Nombre completo"
                  fullWidth
                  variant="outlined"
                  value={selectedClient.name}
                  onChange={(e) => setSelectedClient({ ...selectedClient, name: e.target.value })}
                  disabled={loading.action}
                  sx={{ mb: 2 }}
                  size={isMobile ? "small" : "medium"}
                  required
                />
                
                <TextField
                  margin="dense"
                  label="Descripción"
                  fullWidth
                  variant="outlined"
                  value={selectedClient.description || ''}
                  onChange={(e) => setSelectedClient({ 
                    ...selectedClient, 
                    description: e.target.value 
                  })}
                  disabled={loading.action}
                  sx={{ mb: 2 }}
                  size={isMobile ? "small" : "medium"}
                  multiline
                  rows={3}
                />
                
                <TextField
                  margin="dense"
                  label="ID de Proveedor"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={selectedClient.supplierId || ''}
                  onChange={(e) => setSelectedClient({ 
                    ...selectedClient, 
                    supplierId: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  disabled={loading.action}
                  size={isMobile ? "small" : "medium"}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedClient.status}
                      onChange={(e) => setSelectedClient({ 
                        ...selectedClient, 
                        status: e.target.checked 
                      })}
                      color="primary"
                    />
                  }
                  label="Cliente activo"
                  sx={{ mt: 2 }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenEditDialog(false)}
              disabled={loading.action}
              size={isMobile ? "small" : "medium"}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateClient}
              color="primary"
              variant="contained"
              disabled={loading.action}
              startIcon={loading.action ? <CircularProgress size={20} /> : null}
              size={isMobile ? "small" : "medium"}
            >
              {loading.action ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default ClientsPage;