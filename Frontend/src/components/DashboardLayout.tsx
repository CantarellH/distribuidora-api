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
  ListItemIcon,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import EggIcon from "@mui/icons-material/Egg";
import HandShake from '@mui/icons-material/Handshake'; // Icono para Tipos de Huevo

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    auth?.logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List>
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

          {/* Nuevo enlace para Tipos de Huevo */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard/egg-types"
              selected={location.pathname === "/dashboard/egg-types"}
            >
              <ListItemIcon>
                <EggIcon />
              </ListItemIcon>
              <ListItemText primary="Tipos de Huevo" />
            </ListItemButton>
          </ListItem>

          {/* Nuevo enlace para Proveedores */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard/Suppliers"
              selected={location.pathname === "/dashboard/Suppliers"}
            >
              <ListItemIcon>
                <HandShake />
              </ListItemIcon>
              <ListItemText primary="Proveedores" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Bienvenido, {auth?.user?.name}</Typography>
            <Button color="inherit" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Toolbar>
        </AppBar>

        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
