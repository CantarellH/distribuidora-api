import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  ListItemIcon
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"; // Icono para roles

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // Para resaltar la opción activa

  const handleLogout = () => {
    auth?.logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" }
        }}
      >
        <Toolbar />
        <List>
          {/* Inicio */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard"
              selected={location.pathname === "/dashboard"}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Inicio" />
            </ListItemButton>
          </ListItem>

          {/* Usuarios (Solo para Administradores) */}
          {auth?.user?.role === "Administrador" && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/dashboard/usuarios"
                  selected={location.pathname === "/dashboard/usuarios"}
                >
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Usuarios" />
                </ListItemButton>
              </ListItem>

              {/* NUEVA SECCIÓN: Roles y Permisos (Solo Administradores) */}
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/dashboard/roles"
                  selected={location.pathname === "/dashboard/roles"}
                >
                  <ListItemIcon>
                    <AdminPanelSettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Roles y Permisos" />
                </ListItemButton>
              </ListItem>
            </>
          )}

          {/* Registros */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard/registros"
              selected={location.pathname === "/dashboard/registros"}
            >
              <ListItemIcon>
                <ListAltIcon />
              </ListItemIcon>
              <ListItemText primary="Registros" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Contenido Principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">
              Bienvenido, {auth?.user?.username}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Toolbar>
        </AppBar>

        {/* Contenido de la página */}
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
