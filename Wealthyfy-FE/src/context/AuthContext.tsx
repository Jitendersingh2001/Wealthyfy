import React, { createContext, useEffect, useState, type ReactNode } from "react";
import { keycloakService } from "@/services/keycloak";
import { toast } from "sonner";
import Loader from "@/components/ui/loader";

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
  isLoading: boolean;
  login: () => void;
  register: () => void;
  logout: () => void;
  setTokens: (token?: string, refreshToken?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState<{
    user?: UserProfile;
    token?: string;
    refreshToken?: string;
  }>({});
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);

  const updateAuthData = (user?: UserProfile, token?: string, refreshToken?: string) => {
    setIsAuthenticated(!!user);
    setAuthData({ user, token, refreshToken });
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await keycloakService.init();
        const kc = keycloakService.getKeycloakInstance();

        if (!kc?.authenticated) {
          updateAuthData();
        } else {
          const { given_name, family_name, name, email, email_verified } = kc.idTokenParsed || {};
          const userProfile: UserProfile = {
            firstName: given_name,
            lastName: family_name,
            fullName: name,
            email,
            emailVerified: email_verified,
          };

          updateAuthData(userProfile, kc.token, kc.refreshToken);

          // Set toast trigger flag (do NOT show immediately)
          if (sessionStorage.getItem("kc_login_initiated")) {
            setShowLoginToast(true);
            sessionStorage.removeItem("kc_login_initiated");
          }
        }

        // Set logout toast trigger flag
        if (sessionStorage.getItem("kc_logout_initiated")) {
          setShowLogoutToast(true);
          sessionStorage.removeItem("kc_logout_initiated");
        }
      } catch (err) {
        console.error("Failed to initialize Keycloak:", err);
        updateAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (showLoginToast) toast.success("Logged in successfully");
      if (showLogoutToast) toast.success("Logged out successfully");
    }
  }, [isLoading, showLoginToast, showLogoutToast]);

  const login = () => keycloakService.login();
  const register = () => keycloakService.register();
  const logout = () => keycloakService.logout({ redirectUri: window.location.origin });
  const setTokens = (token?: string, refreshToken?: string) =>
    setAuthData((prev) => ({ ...prev, token, refreshToken }));

  if (isLoading) return <Loader fullscreen />;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        ...authData,
        login,
        register,
        logout,
        setTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
