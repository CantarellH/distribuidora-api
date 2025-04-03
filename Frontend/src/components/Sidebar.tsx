import React, { useState } from "react";
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Toolbar,
  CssBaseline,
  ListItemButton
} from "@mui/material";
import { Home, Settings, Logout, Menu, ChevronLeft } from "@mui/icons-material";

interface SidebarProps {
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <>
      {/* Título */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
          Dashboard
        </Typography>
        <Divider sx={{ backgroundColor: "white", mb: 2 }} />
        
        {/* Menú */}
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <Home sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Inicio" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <Settings sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Configuración" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Cerrar Sesión */}
      <Box sx={{ p: 2 }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={onLogout}>
              <ListItemIcon>
                <Logout sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </>
  );

  if (isMobile) {
    return (
      <>
        <CssBaseline />
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: theme.palette.primary.main }}
          >
            <Menu />
          </IconButton>
        </Toolbar>
        
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 250,
              boxSizing: 'border-box',
              backgroundColor: theme.palette.primary.main,
              color: 'white'
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
              <ChevronLeft />
            </IconButton>
          </Box>
          {drawerContent}
        </Drawer>
      </>
    );
  }

  return (
    <Box
      sx={{
        width: 250,
        height: "100vh",
        backgroundColor: "primary.main",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: 'fixed',
        left: 0,
        top: 0
      }}
    >
      {drawerContent}
    </Box>
  );
};

export default Sidebar;