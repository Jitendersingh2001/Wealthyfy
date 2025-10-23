import React, { createContext, useEffect, useState, type ReactNode } from "react";
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState<{
    user?: UserProfile;
    token?: string;
    refreshToken?: string;
  }>({});

  const updateAuthData = (user?: UserProfile, token?: string, refreshToken?: string) => {
    setIsAuthenticated(!!user);
    setAuthData({ user, token, refreshToken });
  };

  useEffect(() => {
    try {
      const kc = keycloakService.getKeycloakInstance();
      if (!kc?.authenticated) {
        updateAuthData();
        return;
      }

      const { given_name, family_name, name, email, email_verified } = kc.idTokenParsed || {};
      const userProfile: UserProfile = {
        firstName: given_name,
        lastName: family_name,
        fullName: name,
        email,
        emailVerified: email_verified,
      };

      updateAuthData(userProfile, kc.token, kc.refreshToken);
    } catch (err) {
      console.error("Keycloak initialization failed", err);
      updateAuthData();
    }
  }, []);

  const login = () => keycloakService.login();
  const register = () => keycloakService.register();
  const setTokens = (token?: string, refreshToken?: string) =>
    setAuthData(prev => ({ ...prev, token, refreshToken }));

  console.log("AuthContext - isAuthenticated:", isAuthenticated, "authData:", authData);
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        ...authData,
        login,
        register,
        setTokens
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
