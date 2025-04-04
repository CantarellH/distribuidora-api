import { useEffect, useState } from "react";
import api from "../api/api";
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
import { format } from "date-fns";

interface Client {
  id: number;
  name: string;
  contact_info: string;
  status: boolean;
  created_at: string;
  debts?: Debt[];
}

interface Debt {
  id: number;
  amount: number;
  description: string;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
}

const ClientsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [clients, setClients] = useState<Client[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDebtsDialog, setOpenDebtsDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    name: "",
    contact_info: "",
    status: true
  });
  const [loading, setLoading] = useState({
    clients: false,
    action: false,
    debts: false
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
      
      const params = {
        name: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      };
      
      const response = await api.get<Client[]>("/clients", { params });
      setClients(response.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Error al cargar los clientes. Por favor, intente nuevamente.");
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  const fetchClientDebts = async (clientId: number) => {
    try {
      setLoading(prev => ({ ...prev, debts: true }));
      const response = await api.get<Debt[]>(`/clients/${clientId}/debts`);
      return response.data;
    } catch (err) {
      console.error("Error fetching debts:", err);
      setError("Error al cargar los adeudos del cliente");
      return [];
    } finally {
      setLoading(prev => ({ ...prev, debts: false }));
    }
  };

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.contact_info) {
      setError("Nombre e información de contacto son requeridos");
      return;
    }

    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      await api.post("/clients", newClient);
      setOpenCreateDialog(false);
      setNewClient({ name: "", contact_info: "", status: true });
      await fetchClients();
    } catch (err) {
      console.error("Error creating client:", err);
      setError(err.response?.data?.error || "Error al crear el cliente");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      await api.put(`/clients/${selectedClient.id}`, {
        name: selectedClient.name,
        contact_info: selectedClient.contact_info,
        status: selectedClient.status
      });
      
      setOpenEditDialog(false);
      await fetchClients();
    } catch (err) {
      console.error("Error updating client:", err);
      setError(err.response?.data?.error || "Error al actualizar el cliente");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar este cliente?")) return;

    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      await api.delete(`/clients/${id}`);
      await fetchClients();
    } catch (err) {
      console.error("Error deleting client:", err);
      setError("Error al eliminar el cliente");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleOpenDebtsDialog = async (client: Client) => {
    setSelectedClient(client);
    const debts = await fetchClientDebts(client.id);
    setSelectedClient({ ...client, debts });
    setOpenDebtsDialog(true);
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
                  <TableCell>Contacto</TableCell>
                  {!isMobile && <TableCell>Fecha Registro</TableCell>}
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} hover>
                    {!isMobile && <TableCell>{client.id}</TableCell>}
                    <TableCell>{client.name}</TableCell>
                    <TableCell>
                      <Tooltip title={client.contact_info}>
                        <span style={{
                          display: 'inline-block',
                          width: isMobile ? 100 : 150,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {client.contact_info}
                        </span>
                      </Tooltip>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        {format(new Date(client.created_at), 'dd/MM/yyyy')}
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
                      <Tooltip title="Ver adeudos">
                        <IconButton
                          color="info"
                          onClick={() => handleOpenDebtsDialog(client)}
                          disabled={loading.action}
                          size={isMobile ? "small" : "medium"}
                        >
                          <SearchIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setSelectedClient(client);
                            setOpenEditDialog(true);
                          }}
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
            />
            
            <TextField
              margin="dense"
              label="Información de contacto"
              fullWidth
              variant="outlined"
              value={newClient.contact_info}
              onChange={(e) => setNewClient({ ...newClient, contact_info: e.target.value })}
              disabled={loading.action}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
              helperText="Teléfono, email, etc."
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
                />
                
                <TextField
                  margin="dense"
                  label="Información de contacto"
                  fullWidth
                  variant="outlined"
                  value={selectedClient.contact_info}
                  onChange={(e) => setSelectedClient({ ...selectedClient, contact_info: e.target.value })}
                  disabled={loading.action}
                  sx={{ mb: 2 }}
                  size={isMobile ? "small" : "medium"}
                  helperText="Teléfono, email, etc."
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedClient.status}
                      onChange={(e) => setSelectedClient({ ...selectedClient, status: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Cliente activo"
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

        {/* Diálogo para ver adeudos */}
        <Dialog
          open={openDebtsDialog}
          onClose={() => setOpenDebtsDialog(false)}
          fullWidth
          maxWidth="md"
          fullScreen={isMobile}
        >
          <DialogTitle>
            Adeudos de {selectedClient?.name}
          </DialogTitle>
          <DialogContent>
            {loading.debts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {selectedClient?.debts?.length ? (
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size={isMobile ? "small" : "medium"}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Descripción</TableCell>
                          <TableCell align="right">Monto</TableCell>
                          <TableCell>Fecha Vencimiento</TableCell>
                          <TableCell>Estado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedClient.debts.map((debt) => (
                          <TableRow key={debt.id}>
                            <TableCell>{debt.description}</TableCell>
                            <TableCell align="right">
                              ${debt.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {format(new Date(debt.due_date), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  debt.status === 'paid' ? 'Pagado' : 
                                  debt.status === 'pending' ? 'Pendiente' : 'Vencido'
                                }
                                color={
                                  debt.status === 'paid' ? 'success' : 
                                  debt.status === 'pending' ? 'warning' : 'error'
                                }
                                size={isMobile ? "small" : "medium"}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1">
                      Este cliente no tiene adeudos registrados
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDebtsDialog(false)}
              size={isMobile ? "small" : "medium"}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default ClientsPage;