import { useContext, useState } from "react";
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
  IconButton,
  useTheme,
  useMediaQuery,
  CssBaseline,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,          // En lugar de Home
  People,        // En lugar de People
  ListAlt,       // En lugar de ListAlt
  AdminPanelSettings, // En lugar de AdminPanelSettings
  Handshake,     // En lugar de HandShake
  Menu,          // En lugar de Menu
  ChevronLeft    // En lugar de ChevronLeft
} from '@mui/icons-material';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    auth?.logout();
    navigate("/login");
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/dashboard"
            selected={location.pathname === "/dashboard"}
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <Home />
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
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <ListItemIcon>
                  <People />
                </ListItemIcon>
                <ListItemText primary="Usuarios" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard/Clients"
                selected={location.pathname === "/dashboard/Clients"}
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <ListItemIcon>
                  <People />
                </ListItemIcon>
                <ListItemText primary="Clientes" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard/roles"
                selected={location.pathname === "/dashboard/roles"}
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <ListItemIcon>
                  <AdminPanelSettings />
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
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <ListAlt />
            </ListItemIcon>
            <ListItemText primary="Registros" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/dashboard/Suppliers"
            selected={location.pathname === "/dashboard/Suppliers"}
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <Handshake/>
            </ListItemIcon>
            <ListItemText primary="Proveedores" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <Menu />
              </IconButton>
            )}
            <Typography variant="h6">Bienvenido, {auth?.user?.name}</Typography>
          </Box>
          <Button color="inherit" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
              <IconButton onClick={handleDrawerToggle}>
                <ChevronLeft />
              </IconButton>
            </Box>
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          marginTop: '64px' // Para compensar el AppBar fijo
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;