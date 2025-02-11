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
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Switch,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  status: boolean;
  role: { id: number; name: string };
  created_at: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "",
  });
  const [editUser, setEditUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/list");
      setUsers(response.data);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles/list");
    
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error("Error obteniendo roles:", error);
      setRoles([]);
    }
  };
  

  const handleCreateUser = async () => {
    try {
      await api.post("/users/create", newUser);
      setOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error creando usuario:", error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };

  const handleEditUser = async () => {
    if (!editUser) return;
    try {
      await api.put(`/users/update/${editUser.id}`, {
        username: editUser.username,
        role: editUser.role.id,
        status: editUser.status,
      });

      setEditOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error actualizando usuario:", error);
    }
  };

  return (
    <DashboardLayout>
      <Typography variant="h4">Gestión de Usuarios</Typography>

      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Agregar Usuario
      </Button>

      {}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        <DialogContent>
          <TextField
            label="Usuario"
            fullWidth
            margin="dense"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="dense"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Rol</InputLabel>
            <Select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
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
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleCreateUser} color="primary">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          {editUser && (
            <>
              <TextField
                label="Usuario"
                fullWidth
                margin="dense"
                value={editUser.username}
                onChange={(e) =>
                  setEditUser({ ...editUser, username: e.target.value })
                }
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Rol</InputLabel>
                <Select
                  value={editUser.role.id}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      role: { ...editUser.role, id: Number(e.target.value) },
                    })
                  }
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl margin="dense">
                <Typography>Estado</Typography>
                <Switch
                  checked={editUser.status}
                  onChange={(e) =>
                    setEditUser({ ...editUser, status: e.target.checked })
                  }
                />
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleEditUser} color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role ? user.role.name : "Sin Rol"}</TableCell>
                <TableCell>{user.status ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setEditUser(user);
                      setEditOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardLayout>
  );
};

export default UsersPage;
