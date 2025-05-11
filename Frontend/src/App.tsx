import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";
import ClientPage from "./pages/ClientPage";
import RecordsPage from "./pages/RecordsPage";
import SuppliersPage from "./pages/SuppliersPage";
import InventoryPage from "./pages/InventoryPage";
import EggTypesPage from "./pages/EggTypesPage";
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
        <Route
          path="/dashboard/Suppliers"
          element={
            <ProtectedRoute>
              <SuppliersPage/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/egg-types"
          element={
            <ProtectedRoute>
              <EggTypesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/Inventory"
          element={
            <ProtectedRoute>
              <InventoryPage/>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
