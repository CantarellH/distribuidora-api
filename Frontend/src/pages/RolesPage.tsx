import { useEffect, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../components/DashboardLayout";
import {
  Typography,
  Table,
  TableBody,
  TextField,
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
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Collapse,
  Box,
  CircularProgress,
  Alert,
  ListItemButton,
  ListItemIcon
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Add ,
  Edit ,
  Delete 
} from "@mui/icons-material";

interface Permission {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

interface Module {
  id: number;
  name: string;
  permissions?: Permission[];
}

interface RoleModule {
  id: number;
  isActive: boolean;
  module: Module;
}

interface Role {
  id: number;
  name: string;
  permissions: { id: number; isActive: boolean; permission: Permission }[];
  module: RoleModule[];
}

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [openNewRoleModal, setOpenNewRoleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ roles: Role[] }>("/roles/list");
      setRoles(response.data.roles);
    } catch (err) {
      console.error("Error obteniendo roles:", err);
      setError("Error al cargar los roles. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      setError("El nombre del rol no puede estar vacío");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post("/roles/create", { name: newRoleName });
      setNewRoleName("");
      setOpenNewRoleModal(false);
      await fetchRoles();
    } catch (err) {
      console.error("Error creando el rol:", err);
      setError("Error al crear el rol. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = async (role: Role) => {
    setLoading(true);
    setError(null);
    try {
      const updatedRole = roles.find((r) => r.id === role.id) ?? role;
      const response = await api.get<Module[]>("/modules/list");

      if (!response.data?.length) {
        setError("No se encontraron módulos disponibles");
        return;
      }

      const roleModulesMap = new Map(
        updatedRole.module?.map((rm) => [rm.module.id, rm.isActive]) ?? []
      );
      const rolePermissionsMap = new Map(
        updatedRole.permissions?.map((perm) => [perm.permission.id, perm.isActive]) ?? []
      );

      const updatedModules: RoleModule[] = response.data.map((module) => ({
        id: module.id,
        isActive: roleModulesMap.get(module.id) ?? false,
        module: {
          ...module,
          permissions: module.permissions?.map((perm) => ({
            ...perm,
            isActive: rolePermissionsMap.get(perm.id) ?? false,
          })) ?? [],
        },
      }));

      setSelectedRole({ ...updatedRole, module: updatedModules });
      setOpenDialog(true);
    } catch (err) {
      console.error("Error obteniendo módulos:", err);
      setError("Error al cargar los módulos. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = async (moduleId: number) => {
    if (!selectedRole) return;

    setLoading(true);
    setError(null);
    try {
      const module = selectedRole.module.find((m) => m.module.id === moduleId);
      const isActiveNow = module?.isActive ?? false;

      await api.post(
        isActiveNow ? "/modules/remove" : "/modules/assign",
        { roleId: selectedRole.id, modules: [moduleId] }
      );

      const updatedModules = selectedRole.module.map((mod) =>
        mod.module.id === moduleId ? { ...mod, isActive: !mod.isActive } : mod
      );

      const updatedRole = { ...selectedRole, module: updatedModules };
      setSelectedRole(updatedRole);
      setRoles(roles.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
    } catch (err) {
      console.error("Error actualizando módulos:", err);
      setError("Error al actualizar módulo. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (moduleId: number, permissionId: number) => {
    if (!selectedRole) return;

    setLoading(true);
    setError(null);
    try {
      const permission = selectedRole.module
        .find((m) => m.module.id === moduleId)
        ?.module.permissions?.find((p) => p.id === permissionId);
      const isActiveNow = permission?.isActive ?? false;

      await api.post(
        isActiveNow ? "/roles/remove" : "/roles/assign",
        { roleId: selectedRole.id, permissions: [permissionId] }
      );

      const updatedModules = selectedRole.module.map((mod) => {
        if (mod.module.id !== moduleId) return mod;

        const updatedPermissions = mod.module.permissions?.map((perm) =>
          perm.id === permissionId ? { ...perm, isActive: !perm.isActive } : perm
        ) ?? [];

        return { ...mod, module: { ...mod.module, permissions: updatedPermissions } };
      });

      const updatedRole = { ...selectedRole, module: updatedModules };
      setSelectedRole(updatedRole);
      setRoles(roles.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
    } catch (err) {
      console.error("Error actualizando permisos:", err);
      setError("Error al actualizar permiso. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleExpansion = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Roles y Permisos
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenNewRoleModal(true)}
          >
            Nuevo Rol
          </Button>
        </Box>

        {loading && !roles.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre del Rol</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>{role.id}</TableCell>
                    <TableCell>{role.name}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleSelectRole(role)}
                        disabled={loading}>
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Delete />}
                        color="error"
                        onClick={() => handleSelectRole(role)}
                        disabled={loading}>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal para nuevo rol */}
        <Dialog
          open={openNewRoleModal}
          onClose={() => setOpenNewRoleModal(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Crear Nuevo Rol</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre del Rol"
              fullWidth
              variant="outlined"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              disabled={loading}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenNewRoleModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateRole}
              color="primary"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal para edición de permisos */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="md"
          scroll="paper"
        >
          <DialogTitle>
            Permisos para: {selectedRole?.name}
          </DialogTitle>
          <DialogContent dividers>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {selectedRole?.module?.map((module) => (
                  <div key={module.module.id}>
                    <ListItemButton
                      onClick={() => toggleModuleExpansion(module.module.id)}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={Boolean(module.isActive)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleModule(module.module.id);
                          }}
                          disabled={loading}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={module.module.name}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                      {expandedModules.includes(module.module.id) ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </ListItemButton>

                    <Collapse
                      in={expandedModules.includes(module.module.id)}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List disablePadding>
                        {module.module.permissions?.map((permission) => (
                          <ListItem key={permission.id} sx={{ pl: 8 }}>
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                checked={Boolean(permission.isActive)}
                                onChange={() =>
                                  handleTogglePermission(
                                    module.module.id,
                                    permission.id
                                  )
                                }
                                disabled={loading || !module.isActive}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={permission.name}
                              secondary={permission.description}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </div>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenDialog(false)}
              disabled={loading}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default RolesPage;