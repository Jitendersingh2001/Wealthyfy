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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    const initializeKeycloak = async () => {
      try {
        const kc = await keycloakService.init();
        setIsAuthenticated(kc.authenticated);
        setToken(kc.token);
        console.log("Keycloak initialized", kc);
      } catch (err) {
        console.error("Keycloak init failed", err);
        setIsAuthenticated(false);
        setToken(undefined);
      }
    };

    initializeKeycloak();
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
