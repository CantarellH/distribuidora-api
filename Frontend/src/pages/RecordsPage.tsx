import DashboardLayout from "../components/DashboardLayout";
import { Typography, Box } from "@mui/material";

const RecordsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4">Registros</Typography>
        <Typography>Lista de registros y reportes.</Typography>
      </Box>
    </DashboardLayout>
  );
};

export default RecordsPage;
