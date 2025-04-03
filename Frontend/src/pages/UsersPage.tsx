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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Switch,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  FormControlLabel,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from "@mui/icons-material";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  status: boolean;
  role: Role;
  created_at: string;
}

const UsersPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    roleId: ""
  });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [loading, setLoading] = useState({
    users: false,
    roles: false,
    action: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true, roles: true }));
      setError(null);
      
      const [usersRes, rolesRes] = await Promise.all([
        api.get<User[]>("/users/list"),
        api.get<{ roles: Role[] }>("/roles/list")
      ]);
      
      setUsers(usersRes.data);
      setRoles(rolesRes.data.roles || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos. Por favor, intente nuevamente.");
    } finally {
      setLoading(prev => ({ ...prev, users: false, roles: false }));
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.roleId) {
      setError("Todos los campos son requeridos");
      return;
    }

    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      await api.post("/users/create", {
        username: newUser.username,
        password: newUser.password,
        role: newUser.roleId
      });
      
      setOpenCreateDialog(false);
      setNewUser({ username: "", password: "", roleId: "" });
      await fetchData();
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.message || "Error al crear el usuario");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar este usuario?")) return;

    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      await api.delete(`/users/${id}`);
      await fetchData();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Error al eliminar el usuario");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleEditUser = async () => {
    if (!editUser) return;

    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      await api.put(`/users/update/${editUser.id}`, {
        username: editUser.username,
        role: editUser.role.id,
        status: editUser.status
      });
      
      setOpenEditDialog(false);
      await fetchData();
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.response?.data?.message || "Error al actualizar el usuario");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleOpenEditDialog = (user: User) => {
    setEditUser(user);
    setOpenEditDialog(true);
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
            Gestión de Usuarios
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={!isMobile && <AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            disabled={loading.users || loading.roles}
            size={isMobile ? "small" : "medium"}
            fullWidth={isMobile}
          >
            {isMobile ? <AddIcon /> : 'Nuevo Usuario'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading.users ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table size={isMobile ? "small" : "medium"} aria-label="users table">
              <TableHead>
                <TableRow>
                  {!isMobile && <TableCell>ID</TableCell>}
                  <TableCell>Usuario</TableCell>
                  <TableCell>Rol</TableCell>
                  {!isMobile && <TableCell>Estado</TableCell>}
                  {!isTablet && !isMobile && <TableCell>Fecha Creación</TableCell>}
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    {!isMobile && <TableCell>{user.id}</TableCell>}
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role?.name || "Sin rol"} 
                        color={user.role ? "primary" : "default"}
                        size={isMobile ? "small" : "medium"}
                      />
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        {user.status ? (
                          <Chip
                            icon={<CheckCircleIcon fontSize="small" />}
                            label={isTablet ? "" : "Activo"}
                            color="success"
                            size={isMobile ? "small" : "medium"}
                          />
                        ) : (
                          <Chip
                            icon={<CancelIcon fontSize="small" />}
                            label={isTablet ? "" : "Inactivo"}
                            color="error"
                            size={isMobile ? "small" : "medium"}
                          />
                        )}
                      </TableCell>
                    )}
                    {!isTablet && !isMobile && (
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(user)}
                          disabled={loading.action}
                          size={isMobile ? "small" : "medium"}
                        >
                          <EditIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Eliminar">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
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

        {/* Dialogo para crear usuario */}
        <Dialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          fullWidth
          maxWidth={isMobile ? "xs" : "sm"}
          fullScreen={isMobile}
        >
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre de usuario"
              fullWidth
              variant="outlined"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              disabled={loading.action}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
            />
            
            <TextField
              margin="dense"
              label="Contraseña"
              type="password"
              fullWidth
              variant="outlined"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              disabled={loading.action}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel size={isMobile ? "small" : "medium"}>Rol</InputLabel>
              <Select
                value={newUser.roleId}
                onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
                label="Rol"
                disabled={loading.action || loading.roles}
                size={isMobile ? "small" : "medium"}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              onClick={handleCreateUser}
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

        {/* Dialogo para editar usuario */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          fullWidth
          maxWidth={isMobile ? "xs" : "sm"}
          fullScreen={isMobile}
        >
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogContent>
            {editUser && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Nombre de usuario"
                  fullWidth
                  variant="outlined"
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  disabled={loading.action}
                  sx={{ mb: 2 }}
                  size={isMobile ? "small" : "medium"}
                />
                
                <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                  <InputLabel size={isMobile ? "small" : "medium"}>Rol</InputLabel>
                  <Select
                    value={editUser.role?.id || ""}
                    onChange={(e) => setEditUser({ 
                      ...editUser, 
                      role: roles.find(r => r.id === e.target.value) || editUser.role 
                    })}
                    label="Rol"
                    disabled={loading.action || loading.roles}
                    size={isMobile ? "small" : "medium"}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={editUser.status}
                      onChange={(e) => setEditUser({ ...editUser, status: e.target.checked })}
                      disabled={loading.action}
                      size={isMobile ? "small" : "medium"}
                    />
                  }
                  label={editUser.status ? "Activo" : "Inactivo"}
                  labelPlacement="start"
                  sx={{ ml: 0 }}
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
              onClick={handleEditUser}
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

export default UsersPage;