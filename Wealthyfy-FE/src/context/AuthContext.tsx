// auth-context.tsx
import React, { createContext, useEffect, useState } from "react";
import { keycloakService } from "@/services/keycloak";

interface UserProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  token?: string;
  tokenExpiry?: number;
  refreshToken?: string;
  refreshTokenExpiry?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user?: UserProfile;
  login: () => void;
  register: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | undefined>(undefined);

  useEffect(() => {
    try {
      const kc = keycloakService.getKeycloakInstance();
      if (!kc) {
        setIsAuthenticated(false);
        setUser(undefined);
        return;
      }

      if (kc.authenticated) {
        setIsAuthenticated(true);

        const idToken = kc.idTokenParsed || {};
        setUser({
          firstName: idToken.given_name,
          lastName: idToken.family_name,
          fullName: idToken.name,
          email: idToken.email,
          emailVerified: idToken.email_verified,
          token: kc.token,
          tokenExpiry: kc.tokenParsed?.exp,
          refreshToken: kc.refreshToken,
          refreshTokenExpiry: kc.refreshTokenParsed?.exp,
        });
      } else {
        setIsAuthenticated(false);
        setUser(undefined);
      }
    } catch (err) {
      console.error("Keycloak initialization failed", err);
      setIsAuthenticated(false);
      setUser(undefined);
    }
  }, []);

  const login = () => keycloakService.login();
  const register = () => keycloakService.register();

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
