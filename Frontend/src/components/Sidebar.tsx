import React from "react";
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Typography } from "@mui/material";
import { Home, Settings, Logout } from "@mui/icons-material";

const Sidebar: React.FC = () => {
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
        p: 2,
      }}
    >
      {/* Título */}
      <Box>
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
          Dashboard
        </Typography>
        <Divider sx={{ backgroundColor: "white" }} />
        {/* Menú */}
        <List>
          <ListItem >
            <ListItemIcon>
              <Home sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Inicio" />
          </ListItem>
          <ListItem >
            <ListItemIcon>
              <Settings sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Configuración" />
          </ListItem>
        </List>
      </Box>

      {/* Cerrar Sesión */}
      <List>
        <ListItem >
          <ListItemIcon>
            <Logout sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
