import { useState, useEffect, ReactNode } from "react";
import api from "../api/api";
import { AuthContext } from "./AuthContext";

interface User {
  id: number;
  username: string;
  role: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/users/me")
        .then((response) => {
          setUser(response.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        });
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    api.get("/users/me")
      .then((response) => {
        setUser(response.data);
        setIsAuthenticated(true);
      })
      .catch(() => {
        logout();
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
