import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import { Button, TextField, Typography, Container, Box } from "@mui/material";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/users/login", { username, password });
      const { token } = response.data;

      auth?.login(token);

      navigate("/dashboard");
    } catch (error) {
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>Iniciar Sesión</Typography>

        {error && <Typography color="error">{error}</Typography>}

        <form onSubmit={handleLogin}>
          <TextField
            label="Usuario"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Iniciar Sesión
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;
