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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

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
  const [open, setOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [newRoleName, setNewRoleName] = useState<string>("");
  const [openNewRoleModal, setOpenNewRoleModal] = useState(false);


  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get<{ roles: Role[] }>("/roles/list");
      setRoles(response.data.roles);
    } catch (error) {
      console.error("Error obteniendo roles:", error);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      alert("El nombre del rol no puede estar vacío.");
      return;
    }

    try {
      await api.post("/roles/create", { name: newRoleName });
      setNewRoleName("");
      setOpenNewRoleModal(false);
      fetchRoles();
    } catch (error) {
      console.error("Error creando el rol:", error);
    }
  };


  const handleSelectRole = async (role: Role) => {
    try {
      const updatedRole = roles.find((r) => r.id === role.id) ?? role;
  
      const response = await api.get<Module[]>("/modules/list");
  
      if (!response.data || response.data.length === 0) {
        console.error("Error: La API devolvió un array vacío.");
        return;
      }
  
      const allModules = response.data;
  
      const roleModulesMap = new Map(updatedRole.module?.map((rm) => [rm.module.id, rm.isActive]) ?? []);
      const rolePermissionsMap = new Map(
        updatedRole.permissions?.map((perm) => [perm.permission.id, perm.isActive]) ?? []
      );
  
      const updatedModules: RoleModule[] = allModules.map((module) => ({
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
      setOpen(true);
    } catch (error) {
      console.error("Error obteniendo módulos:", error);
    }
  };
  

  const handleToggleModule = async (moduleId: number) => {
    if (!selectedRole) return;
  
    try {
      const module = selectedRole.module.find((m) => m.module.id === moduleId);
      const isActiveNow = module?.isActive ?? false;
  
      if (isActiveNow) {
        await api.post("/modules/remove", { roleId: selectedRole.id, modules: [moduleId] });
      } else {
        await api.post("/modules/assign", { roleId: selectedRole.id, modules: [moduleId] });
      }
  
      const updatedModules = selectedRole.module.map((mod) =>
        mod.module.id === moduleId ? { ...mod, isActive: !mod.isActive } : mod
      );
  
      setSelectedRole({ ...selectedRole, module: updatedModules });
  
      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role.id === selectedRole.id ? { ...role, module: updatedModules } : role
        )
      );
  
    } catch (error) {
      console.error("Error actualizando módulos:", error);
    }
  };

  const handleTogglePermission = async (moduleId: number, permissionId: number) => {
    if (!selectedRole) return;
  
    try {
      const module = selectedRole.module.find((m) => m.module.id === moduleId);
      const permission = module?.module.permissions?.find((p) => p.id === permissionId);
      const isActiveNow = permission?.isActive ?? false;
  
      if (isActiveNow) {
        await api.post("/roles/remove", { roleId: selectedRole.id, permissions: [permissionId] });
      } else {
        await api.post("/roles/assign", { roleId: selectedRole.id, permissions: [permissionId] });
      }
  
      const updatedModules = selectedRole.module.map((mod) => {
        if (mod.module.id !== moduleId) return mod;
  
        const updatedPermissions = mod.module.permissions?.map((perm) =>
          perm.id === permissionId ? { ...perm, isActive: !perm.isActive } : perm
        ) ?? [];
  
        return { ...mod, module: { ...mod.module, permissions: updatedPermissions } };
      });
  
      setSelectedRole({ ...selectedRole, module: updatedModules });
  
      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role.id === selectedRole.id ? { ...role, module: updatedModules } : role
        )
      );
  
      
    } catch (error) {
      console.error("Error actualizando permisos:", error);
    }
  };

  const toggleModuleExpansion = (moduleId: number) => {
    setExpandedModules(
      (prevExpanded) =>
        prevExpanded.includes(moduleId)
          ? prevExpanded.filter((id) => id !== moduleId)
          : [...prevExpanded, moduleId]
    );
  };


  useEffect(() => {
    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === selectedRole?.id ? { ...selectedRole } : role
      )
    );
  }, [selectedRole]);
  

  return (
    <DashboardLayout>
      <Typography variant="h4">Gestión de Roles, Módulos y Permisos</Typography>
  
      {}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, mb: 2 }}
        onClick={() => setOpenNewRoleModal(true)}
      >
        Crear Nuevo Rol
      </Button>
  
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell>{role.name}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={() => handleSelectRole(role)}
                  >
                    Administrar Módulos & Permisos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  
      {}
      <Dialog open={openNewRoleModal} onClose={() => setOpenNewRoleModal(false)}>
        <DialogTitle>Crear Nuevo Rol</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre del Rol"
            fullWidth
            variant="outlined"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewRoleModal(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleCreateRole} color="primary" variant="contained">
            Crear Rol
          </Button>
        </DialogActions>
      </Dialog>
  
      {}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          fetchRoles();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Administrar Módulos & Permisos</DialogTitle>
        <DialogContent>
          <List>
            {selectedRole?.module?.map((module) => (
              <div key={module.module.id}>
                <ListItem>
                  <Checkbox
                    checked={Boolean(module.isActive)}
                    onChange={() => handleToggleModule(module.module.id)}
                  />
                  <ListItemText primary={module.module.name} />
                  <Button onClick={() => toggleModuleExpansion(module.module.id)}>
                    {expandedModules.includes(module.module.id) ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </Button>
                </ListItem>
  
                <Collapse
                  in={expandedModules.includes(module.module.id)}
                  timeout="auto"
                  unmountOnExit
                >
                  <List sx={{ pl: 4 }}>
                    {module.module.permissions?.map((permission) => (
                      <ListItem key={permission.id}>
                        <Checkbox
                          checked={Boolean(permission.isActive)}
                          onChange={() =>
                            handleTogglePermission(
                              module.module.id,
                              permission.id
                            )
                          }
                        />
                        <ListItemText primary={permission.description} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </div>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default RolesPage;
