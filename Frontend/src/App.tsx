import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";
import ClientPage from "./pages/ClientPage";
import RecordsPage from "./pages/RecordsPage";
import SuppliersPage from "./pages/SuppliersPage"; // ✅ Importa la nueva página
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/usuarios"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        /> 
        <Route
        path="/dashboard/Clients"
        element={
          <ProtectedRoute>
            <ClientPage />
          </ProtectedRoute>
        }
      />
        <Route
          path="/dashboard/registros"
          element={
            <ProtectedRoute>
              <RecordsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/roles"
          element={
            <ProtectedRoute>
              <RolesPage />
            </ProtectedRoute>
          }
        />
        {/* ✅ Nueva ruta para Tipos de Huevo */}
        <Route
          path="/dashboard/Suppliers"
          element={
            <ProtectedRoute>
              <SuppliersPage/>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
