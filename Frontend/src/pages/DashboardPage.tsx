import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { Typography, Box, Paper } from "@mui/material";

const DashboardPage: React.FC = () => {
  const auth = useContext(AuthContext);

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom>Dashboard Principal</Typography>
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6">Información del Usuario</Typography>
          <Typography>👤 Usuario: {auth?.user?.name}</Typography>
          <Typography>🔹 Rol: {auth?.user?.role}</Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
