// auth-context.tsx
import React, { createContext, useEffect, useState } from "react";
import { keycloakService } from "@/services/keycloak";

interface UserProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user?: UserProfile;
  token?: string;
  refreshToken?: string;
  login: () => void;
  register: () => void;
  setTokens: (token?: string, refreshToken?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [refreshToken, setRefreshToken] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    try {
      const kc = keycloakService.getKeycloakInstance();
      if (!kc || !kc.authenticated) {
        setIsAuthenticated(false);
        setUser(undefined);
        setToken(undefined);
        setRefreshToken(undefined);
        return;
      }

      const idToken = kc.idTokenParsed || {};
      setIsAuthenticated(true);
      setUser({
        firstName: idToken.given_name,
        lastName: idToken.family_name,
        fullName: idToken.name,
        email: idToken.email,
        emailVerified: idToken.email_verified,
      });

      // Separate token state
      setToken(kc.token);
      setRefreshToken(kc.refreshToken);
    } catch (err) {
      console.error("Keycloak initialization failed", err);
      setIsAuthenticated(false);
      setUser(undefined);
      setToken(undefined);
      setRefreshToken(undefined);
    }
  }, []);

  const login = () => keycloakService.login();
  const register = () => keycloakService.register();

  const setTokens = (newToken?: string, newRefreshToken?: string) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        refreshToken,
        login,
        register,
        setTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
