import { useEffect, useState } from "react";
import { clientApi } from "../api/api";
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
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";

interface Direccion {
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  codigoPostal: string;
  alcaldiaMunicipio: string;
  estado: string;
  pais: string;
}

interface ClientFormData {
  name: string;
  contact_info: string;
  status: boolean;
  rfc?: string;
  emailFiscal?: string;
  regimenFiscal?: string;
  direccion: Direccion;
}

interface Client extends ClientFormData {
  id: number;
  created_at: string;
  // Campos adicionales del backend
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  codigoPostal?: string;
  alcaldiaMunicipio?: string;
  estado?: string;
  pais?: string;
}

const ClientsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [clients, setClients] = useState<Client[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const initialClientState: ClientFormData = {
    name: "",
    contact_info: "",
    status: true,
    rfc: "",
    emailFiscal: "",
    regimenFiscal: "",
    direccion: {
      calle: "",
      numeroExterior: "",
      numeroInterior: "",
      colonia: "",
      codigoPostal: "",
      alcaldiaMunicipio: "",
      estado: "",
      pais: "México",
    },
  };

  const [newClient, setNewClient] =
    useState<ClientFormData>(initialClientState);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState({
    clients: false,
    action: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading((prev) => ({ ...prev, clients: true }));
      setError(null);
      const params = {
        search: searchTerm, // Parámetro genérico para búsqueda
      };

      const response = await clientApi.getAll(name? params : undefined);
      if (response && response.data) {
        setClients(response.data);
      } else {
        setError("No se recibieron datos de clientes");
        setClients([]);
      }
    } catch (err: unknown) {
      console.error("Error fetching clients:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar los clientes"
      );
    } finally {
      setLoading((prev) => ({ ...prev, clients: false }));
    }
  };

  const handleCreateClient = async () => {
  if (!newClient.name || !newClient.contact_info) {
    setError("Nombre e información de contacto son requeridos");
    return;
  }

  // Validar dirección
  if (
    !newClient.direccion.calle ||
    !newClient.direccion.numeroExterior ||
    !newClient.direccion.colonia ||
    !newClient.direccion.codigoPostal ||
    !newClient.direccion.alcaldiaMunicipio ||
    !newClient.direccion.estado
  ) {
    setError(
      "Todos los campos de dirección son requeridos excepto número interior"
    );
    return;
  }

  setLoading((prev) => ({ ...prev, action: true }));
  setError(null);

  try {
    // Preparar datos para enviar al backend (similar a como se hace en la edición)
    const createData = {
      ...newClient,
      // Aplanar el objeto direccion
      calle: newClient.direccion.calle,
      numeroExterior: newClient.direccion.numeroExterior,
      numeroInterior: newClient.direccion.numeroInterior || undefined,
      colonia: newClient.direccion.colonia,
      codigoPostal: newClient.direccion.codigoPostal,
      alcaldiaMunicipio: newClient.direccion.alcaldiaMunicipio,
      estado: newClient.direccion.estado,
      pais: newClient.direccion.pais,
      // Eliminar el objeto direccion para no enviar datos duplicados
      direccion: undefined,
    };

    await clientApi.create(createData); // Enviar createData en lugar de newClient
    setOpenCreateDialog(false);
    setNewClient(initialClientState);
    await fetchClients();
  } catch (err: unknown) {
    console.error("Error creating client:", err);
    setError(
      err instanceof Error ? err.message : "Error al crear el cliente"
    );
  } finally {
    setLoading((prev) => ({ ...prev, action: false }));
  }
};

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    // Validaciones básicas
    if (!selectedClient.name || !selectedClient.contact_info) {
      setError("Nombre e información de contacto son requeridos");
      return;
    }

    setLoading((prev) => ({ ...prev, action: true }));
    setError(null);

    try {
      // Preparar datos para enviar al backend
      const updateData = {
        ...selectedClient,
        // Aplanar el objeto direccion
        calle: selectedClient.direccion.calle,
        numeroExterior: selectedClient.direccion.numeroExterior,
        numeroInterior: selectedClient.direccion.numeroInterior || undefined,
        colonia: selectedClient.direccion.colonia,
        codigoPostal: selectedClient.direccion.codigoPostal,
        alcaldiaMunicipio: selectedClient.direccion.alcaldiaMunicipio,
        estado: selectedClient.direccion.estado,
        pais: selectedClient.direccion.pais,
        // Eliminar el objeto direccion para no enviar datos duplicados
        direccion: undefined,
      };

      await clientApi.update(selectedClient.id, updateData);
      setOpenEditDialog(false);
      await fetchClients();
    } catch (err) {
      setError("Error al actualizar el cliente");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar este cliente?"))
      return;

    setLoading((prev) => ({ ...prev, action: true }));
    setError(null);

    try {
      await clientApi.delete(id);
      await fetchClients();
    } catch (err: unknown) {
      console.error("Error deleting client:", err);
      setError(
        err instanceof Error ? err.message : "Error al eliminar el cliente"
      );
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const handleOpenEditDialog = (client: Client) => {
    // Crear objeto direccion basado en los campos planos o usar los valores existentes
    const direccion: Direccion = {
      calle: client.calle || client.direccion?.calle || "",
      numeroExterior:
        client.numeroExterior || client.direccion?.numeroExterior || "",
      numeroInterior:
        client.numeroInterior || client.direccion?.numeroInterior || "",
      colonia: client.colonia || client.direccion?.colonia || "",
      codigoPostal: client.codigoPostal || client.direccion?.codigoPostal || "",
      alcaldiaMunicipio:
        client.alcaldiaMunicipio || client.direccion?.alcaldiaMunicipio || "",
      estado: client.estado || client.direccion?.estado || "",
      pais: client.pais || client.direccion?.pais || "México",
    };

    setSelectedClient({
      ...client,
      direccion,
      rfc: client.rfc || "",
      emailFiscal: client.emailFiscal || "",
      regimenFiscal: client.regimenFiscal || "",
    });
    setOpenEditDialog(true);
  };

  // (Remove this duplicate block, as it is incorrect and causes the 'clients' is not defined error)

  const filteredClients = clients.filter((client) => {
  const searchLower = searchTerm.toLowerCase();
  return (
    client.name.toLowerCase().includes(searchLower) ||
    client.contact_info.toLowerCase().includes(searchLower) ||
    (client.rfc && client.rfc.toLowerCase().includes(searchLower)) ||
    (client.emailFiscal && client.emailFiscal.toLowerCase().includes(searchLower)) ||
    (client.regimenFiscal && client.regimenFiscal.toLowerCase().includes(searchLower)) ||
    (client.direccion.calle && client.direccion.calle.toLowerCase().includes(searchLower)) ||
    (client.direccion.colonia && client.direccion.colonia.toLowerCase().includes(searchLower)) ||
    (client.direccion.alcaldiaMunicipio && client.direccion.alcaldiaMunicipio.toLowerCase().includes(searchLower))
  );
});

  return (
    <DashboardLayout>
      <Box sx={{ p: isMobile ? 1 : 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            mb: 3,
            gap: isMobile ? 2 : 0,
          }}
        >
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
            Gestión de Clientes
          </Typography>

          <Box
            sx={{ display: "flex", gap: 2, width: isMobile ? "100%" : "auto" }}
          >
           
            <Button
              variant="contained"
              color="primary"
              startIcon={!isMobile && <AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              disabled={loading.clients}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? <AddIcon /> : "Nuevo Cliente"}
            </Button>
          </Box>
        </Box>

        

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading.clients ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ maxWidth: "100%", overflowX: "auto" }}
          >
            <Table
              size={isMobile ? "small" : "medium"}
              aria-label="clients table"
            >
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
                {filteredClients.map((client) => (
                  <TableRow key={client.id} hover>
                    {!isMobile && <TableCell>{client.id}</TableCell>}
                    <TableCell>{client.name}</TableCell>
                    <TableCell>
                      <Tooltip title={client.contact_info}>
                        <span
                          style={{
                            display: "inline-block",
                            width: isMobile ? 100 : 150,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {client.contact_info}
                        </span>
                      </Tooltip>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        {client.created_at
                          ? format(parseISO(client.created_at), "dd/MM/yyyy")
                          : "N/A"}
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
                          <DeleteIcon
                            fontSize={isMobile ? "small" : "medium"}
                          />
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
            {/* Campos existentes (nombre, contacto) */}
            <TextField
              autoFocus
              margin="dense"
              label="Nombre completo"
              fullWidth
              variant="outlined"
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
              disabled={loading.action}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
              required
            />

            <TextField
              margin="dense"
              label="Información de contacto"
              fullWidth
              variant="outlined"
              value={newClient.contact_info}
              onChange={(e) =>
                setNewClient({ ...newClient, contact_info: e.target.value })
              }
              disabled={loading.action}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
              required
            />

            {/* Nuevos campos fiscales */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Datos Fiscales
            </Typography>

            <TextField
              margin="dense"
              label="RFC"
              fullWidth
              variant="outlined"
              value={newClient.rfc || ""}
              onChange={(e) =>
                setNewClient({ ...newClient, rfc: e.target.value })
              }
              disabled={loading.action}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
            />

            <TextField
              margin="dense"
              label="Email Fiscal"
              fullWidth
              variant="outlined"
              value={newClient.emailFiscal || ""}
              onChange={(e) =>
                setNewClient({ ...newClient, emailFiscal: e.target.value })
              }
              disabled={loading.action}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
            />

            <TextField
              margin="dense"
              label="Régimen Fiscal"
              fullWidth
              variant="outlined"
              value={newClient.regimenFiscal || ""}
              onChange={(e) =>
                setNewClient({ ...newClient, regimenFiscal: e.target.value })
              }
              disabled={loading.action}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
            />

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Dirección Fiscal
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  margin="dense"
                  label="Calle"
                  fullWidth
                  variant="outlined"
                  value={newClient.direccion?.calle || ""}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      direccion: {
                        ...newClient.direccion,
                        calle: e.target.value,
                      },
                    })
                  }
                  disabled={loading.action}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  margin="dense"
                  label="N° Ext."
                  fullWidth
                  variant="outlined"
                  value={newClient.direccion?.numeroExterior || ""}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      direccion: {
                        ...newClient.direccion,
                        numeroExterior: e.target.value || "",
                      },
                    })
                  }
                  disabled={loading.action}
                  size={isMobile ? "small" : "medium"}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  margin="dense"
                  label="N° Int. (Opcional)"
                  fullWidth
                  variant="outlined"
                  value={newClient.direccion?.numeroInterior || ""}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      direccion: {
                        ...newClient.direccion,
                        numeroInterior: e.target.value,
                      },
                    })
                  }
                  disabled={loading.action}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  margin="dense"
                  label="Colonia"
                  fullWidth
                  variant="outlined"
                  value={newClient.direccion?.colonia || ""}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      direccion: {
                        ...newClient.direccion,
                        colonia: e.target.value,
                      },
                    })
                  }
                  disabled={loading.action}
                  size={isMobile ? "small" : "medium"}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  margin="dense"
                  label="Código Postal"
                  fullWidth
                  variant="outlined"
                  value={newClient.direccion?.codigoPostal || ""}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      direccion: {
                        ...newClient.direccion,
                        codigoPostal: e.target.value,
                      },
                    })
                  }
                  disabled={loading.action}
                  size={isMobile ? "small" : "medium"}
                  required
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  margin="dense"
                  label="Alcaldía/Municipio"
                  fullWidth
                  variant="outlined"
                  value={newClient.direccion?.alcaldiaMunicipio || ""}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      direccion: {
                        ...newClient.direccion,
                        alcaldiaMunicipio: e.target.value,
                      },
                    })
                  }
                  disabled={loading.action}
                  size={isMobile ? "small" : "medium"}
                  required
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  margin="dense"
                  label="Estado"
                  fullWidth
                  variant="outlined"
                  value={newClient.direccion?.estado || ""}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      direccion: {
                        ...newClient.direccion,
                        estado: e.target.value,
                      },
                    })
                  }
                  disabled={loading.action}
                  size={isMobile ? "small" : "medium"}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  margin="dense"
                  label="País"
                  fullWidth
                  variant="outlined"
                  value={newClient.direccion?.pais || "México"}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      direccion: {
                        ...newClient.direccion,
                        pais: e.target.value,
                      },
                    })
                  }
                  disabled={loading.action}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={newClient.status}
                  onChange={(e) =>
                    setNewClient({ ...newClient, status: e.target.checked })
                  }
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
              {loading.action ? "Creando..." : "Crear"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo para editar cliente */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          fullWidth
          maxWidth="md"
          fullScreen={isMobile}
        >
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Sección de información básica */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Información Básica
                </Typography>

                <TextField
                  margin="dense"
                  label="Nombre completo"
                  fullWidth
                  value={selectedClient?.name || ""}
                  onChange={(e) =>
                    setSelectedClient((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  disabled={loading.action}
                  sx={{ mb: 2 }}
                  required
                />

                <TextField
                  margin="dense"
                  label="Información de contacto"
                  fullWidth
                  value={selectedClient?.contact_info || ""}
                  onChange={(e) =>
                    setSelectedClient((prev) =>
                      prev ? { ...prev, contact_info: e.target.value } : null
                    )
                  }
                  disabled={loading.action}
                  sx={{ mb: 2 }}
                  required
                />
              </Grid>

              {/* Sección de datos fiscales */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Datos Fiscales
                </Typography>

                <TextField
                  margin="dense"
                  label="RFC"
                  fullWidth
                  value={selectedClient?.rfc || ""}
                  onChange={(e) =>
                    setSelectedClient((prev) =>
                      prev ? { ...prev, rfc: e.target.value } : null
                    )
                  }
                  disabled={loading.action}
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="dense"
                  label="Email Fiscal"
                  fullWidth
                  type="email"
                  value={selectedClient?.emailFiscal || ""}
                  onChange={(e) =>
                    setSelectedClient((prev) =>
                      prev ? { ...prev, emailFiscal: e.target.value } : null
                    )
                  }
                  disabled={loading.action}
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="dense"
                  label="Régimen Fiscal"
                  fullWidth
                  value={selectedClient?.regimenFiscal || ""}
                  onChange={(e) =>
                    setSelectedClient((prev) =>
                      prev ? { ...prev, regimenFiscal: e.target.value } : null
                    )
                  }
                  disabled={loading.action}
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* Sección de dirección fiscal */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Dirección Fiscal
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      margin="dense"
                      label="Calle"
                      fullWidth
                      value={selectedClient?.direccion.calle || ""}
                      onChange={(e) =>
                        setSelectedClient((prev) =>
                          prev
                            ? {
                                ...prev,
                                direccion: {
                                  ...prev.direccion,
                                  calle: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      disabled={loading.action}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      margin="dense"
                      label="N° Exterior"
                      fullWidth
                      value={selectedClient?.direccion.numeroExterior || ""}
                      onChange={(e) =>
                        setSelectedClient((prev) =>
                          prev
                            ? {
                                ...prev,
                                direccion: {
                                  ...prev.direccion,
                                  numeroExterior: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      disabled={loading.action}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      margin="dense"
                      label="N° Interior"
                      fullWidth
                      value={selectedClient?.direccion.numeroInterior || ""}
                      onChange={(e) =>
                        setSelectedClient((prev) =>
                          prev
                            ? {
                                ...prev,
                                direccion: {
                                  ...prev.direccion,
                                  numeroInterior: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      disabled={loading.action}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      margin="dense"
                      label="Colonia"
                      fullWidth
                      value={selectedClient?.direccion.colonia || ""}
                      onChange={(e) =>
                        setSelectedClient((prev) =>
                          prev
                            ? {
                                ...prev,
                                direccion: {
                                  ...prev.direccion,
                                  colonia: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      disabled={loading.action}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      margin="dense"
                      label="Código Postal"
                      fullWidth
                      value={selectedClient?.direccion.codigoPostal || ""}
                      onChange={(e) =>
                        setSelectedClient((prev) =>
                          prev
                            ? {
                                ...prev,
                                direccion: {
                                  ...prev.direccion,
                                  codigoPostal: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      disabled={loading.action}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      margin="dense"
                      label="Alcaldía/Municipio"
                      fullWidth
                      value={selectedClient?.direccion.alcaldiaMunicipio || ""}
                      onChange={(e) =>
                        setSelectedClient((prev) =>
                          prev
                            ? {
                                ...prev,
                                direccion: {
                                  ...prev.direccion,
                                  alcaldiaMunicipio: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      disabled={loading.action}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      margin="dense"
                      label="Estado"
                      fullWidth
                      value={selectedClient?.direccion.estado || ""}
                      onChange={(e) =>
                        setSelectedClient((prev) =>
                          prev
                            ? {
                                ...prev,
                                direccion: {
                                  ...prev.direccion,
                                  estado: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      disabled={loading.action}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={1}>
                    <TextField
                      margin="dense"
                      label="País"
                      fullWidth
                      value={selectedClient?.direccion.pais || "México"}
                      onChange={(e) =>
                        setSelectedClient((prev) =>
                          prev
                            ? {
                                ...prev,
                                direccion: {
                                  ...prev.direccion,
                                  pais: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      disabled={loading.action}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={selectedClient?.status || false}
                  onChange={(e) =>
                    setSelectedClient((prev) =>
                      prev ? { ...prev, status: e.target.checked } : null
                    )
                  }
                  color="primary"
                />
              }
              label="Cliente activo"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenEditDialog(false)}
              disabled={loading.action}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateClient}
              color="primary"
              variant="contained"
              disabled={loading.action}
              startIcon={loading.action ? <CircularProgress size={20} /> : null}
            >
              {loading.action ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default ClientsPage;
