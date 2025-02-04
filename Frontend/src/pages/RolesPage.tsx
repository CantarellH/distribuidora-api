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
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface Role {
  id: number;
  name: string;
  modules: Module[];
}

interface Module {
  id: number;
  name: string;
  permissions: Permission[];
}

interface Permission {
  id: number;
  name: string;
  description: string;
  moduleId: number;
}

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [open, setOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);

  useEffect(() => {
    fetchRoles();
    fetchModules();
  }, []);

  // ✅ Obtener los roles y garantizar que siempre tengan módulos asignados
  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles/list");
      const rolesData: Role[] = response.data.roles.map((role) => ({
        ...role,
        modules: role.modules ?? [], // ✅ Garantizar que modules existe
      }));
      setRoles(rolesData);
    } catch (error) {
      console.error("Error obteniendo roles:", error);
    }
  };

  // ✅ Obtener la lista de módulos, asegurando que tengan permisos asignados
  const fetchModules = async () => {
    try {
      const response = await api.get("/modules/list");
      const modulesData: Module[] = response.data.map((mod) => ({
        ...mod,
        permissions: [], // Inicialmente vacío, los permisos se llenan después
      }));

      const permissionsResponse = await api.get("/roles/permissions/all");
      const permissionsData: Permission[] = permissionsResponse.data;

      // ✅ Asignar permisos a los módulos correspondientes
      modulesData.forEach((mod) => {
        mod.permissions = permissionsData.filter((perm) => perm.moduleId === mod.id);
      });

      setModules(modulesData);
    } catch (error) {
      console.error("Error obteniendo módulos y permisos:", error);
    }
  };

  // ✅ Seleccionar un rol y asegurarse de que tenga módulos
  const handleSelectRole = (role: Role) => {
    console.log("Rol seleccionado:", role);

    setSelectedRole({
      ...role,
      modules: modules.map((mod) => ({
        ...mod,
        permissions: mod.permissions ?? [],
      })), // ✅ Mostrar todos los módulos, incluso si no están asignados
    });
    setOpen(true);
  };

  // ✅ Alternar la asignación de módulos al rol
  const handleToggleModule = async (moduleId: number) => {
    if (!selectedRole) return;

    const hasModule = selectedRole.modules.some((m) => m.id === moduleId);

    setSelectedRole((prevRole) => {
      if (!prevRole) return null;

      const updatedModules = prevRole.modules.map((mod) =>
        mod.id === moduleId
          ? { ...mod, assigned: !hasModule } // ✅ Cambiar el estado del checkbox sin desaparecer el módulo
          : mod
      );

      return { ...prevRole, modules: updatedModules };
    });

    try {
      if (hasModule) {
        await api.post("/modules/remove", {
          roleId: selectedRole.id,
          modules: [moduleId],
        });
      } else {
        await api.post("/modules/assign", {
          roleId: selectedRole.id,
          modules: [moduleId],
        });
      }
    } catch (error) {
      console.error("Error actualizando módulos:", error);
    }
  };

  // ✅ Alternar la asignación de permisos dentro de un módulo
  const handleTogglePermission = async (moduleId: number, permissionId: number) => {
    if (!selectedRole) return;

    setSelectedRole((prevRole) => {
      if (!prevRole) return null;

      const updatedModules = prevRole.modules.map((module) => {
        if (module.id !== moduleId) return module;

        const hasPermission = module.permissions.some((p) => p.id === permissionId);

        let updatedPermissions;
        if (hasPermission) {
          updatedPermissions = module.permissions.filter((p) => p.id !== permissionId);
        } else {
          const permissionToAdd = modules
            .find((m) => m.id === moduleId)
            ?.permissions.find((p) => p.id === permissionId);
          if (!permissionToAdd) return module;
          updatedPermissions = [...module.permissions, permissionToAdd];
        }

        return { ...module, permissions: updatedPermissions };
      });

      return { ...prevRole, modules: updatedModules };
    });

    try {
      await api.post("/roles/assign", {
        roleId: selectedRole.id,
        permissions: [permissionId],
      });
    } catch (error) {
      console.error("Error actualizando permisos:", error);
    }
  };

  // ✅ Expandir módulos para mostrar sus permisos
  const toggleModuleExpansion = (moduleId: number) => {
    setExpandedModules((prevExpanded) =>
      prevExpanded.includes(moduleId)
        ? prevExpanded.filter((id) => id !== moduleId) // Cierra módulo
        : [...prevExpanded, moduleId] // Abre módulo
    );
  };

  return (
    <DashboardLayout>
      <Typography variant="h4">Gestión de Roles, Módulos y Permisos</Typography>

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
                  <Button variant="contained" onClick={() => handleSelectRole(role)}>
                    Administrar Módulos & Permisos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Administrar Módulos & Permisos</DialogTitle>
        <DialogContent>
          <List>
            {selectedRole?.modules?.map((module) => (
              <div key={module.id}>
                <ListItem component="div">
                  <Checkbox
                    checked={selectedRole.modules.some((m) => m.id === module.id)}
                    onChange={() => handleToggleModule(module.id)}
                  />
                  <ListItemText primary={module.name} />
                  <Button onClick={() => toggleModuleExpansion(module.id)}>
                    {expandedModules.includes(module.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Button>
                </ListItem>

                <Collapse in={expandedModules.includes(module.id)} timeout="auto" unmountOnExit>
                  <List sx={{ pl: 4 }}>
                    {module.permissions.map((permission) => (
                      <ListItem key={permission.id} component="div">
                        <Checkbox
                          checked={module.permissions.some((p) => p.id === permission.id)}
                          onChange={() => handleTogglePermission(module.id, permission.id)}
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
