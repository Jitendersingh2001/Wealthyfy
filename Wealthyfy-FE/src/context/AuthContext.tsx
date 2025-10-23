// auth-context.tsx
import React, { createContext, useEffect, useState } from "react";
import { keycloakService } from "@/services/keycloak";

interface AuthContextType {
  isAuthenticated: boolean;
  token?: string;
  login: () => void;
  register: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(keycloakService.isAuthenticated());
  const [token, setToken] = useState<string | undefined>(keycloakService.getToken());

  useEffect(() => {
    const interval = setInterval(async () => {
      if (keycloakService.isAuthenticated()) {
        try {
          await keycloakService.init();
          setIsAuthenticated(true);
          setToken(keycloakService.getToken());
        } catch (err) {
          console.error("🔁 Token refresh failed:", err);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = () => keycloakService.login();
  const register = () => keycloakService.register();

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

