import React, {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { keycloakService } from "@/services/keycloak";
import { toast } from "sonner";
import Loader from "@/components/ui/loader";
import { GENERAL_MESSAGES } from "@/constants/messages";
import { SESSION_KEYS } from "@/constants/sessionKeys";

/* --------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */
interface UserProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  keyclockUserId: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user?: UserProfile;
  isLoading: boolean;
  login: () => void;
  register: () => void;
  logout: () => void;
}

/* --------------------------------------------------------------------------
 * Context
 * -------------------------------------------------------------------------- */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* --------------------------------------------------------------------------
 * Provider
 * -------------------------------------------------------------------------- */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  /* ------------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------------ */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | undefined>(undefined);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);

  /* ------------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------------ */
  const updateUser = (profile?: UserProfile) => {
    setIsAuthenticated(!!profile);
    setUser(profile);
  };

  /* ------------------------------------------------------------------------
   * Initialize Authentication
   * ------------------------------------------------------------------------ */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isRedirect = keycloakService.isLoginRedirect();
        await keycloakService.init();
        const kc = keycloakService.getKeycloakInstance();

        if (!kc?.authenticated) {
          updateUser();
          sessionStorage.removeItem(SESSION_KEYS.KEYCLOAK_LOGIN_TOAST_SHOWN);
        } else {
          const { given_name, family_name, name, email, email_verified, sub } =
            kc.idTokenParsed || {};

          const userProfile: UserProfile = {
            firstName: given_name,
            lastName: family_name,
            fullName: name,
            email,
            emailVerified: email_verified,
            keyclockUserId: sub ?? "",
          };

          updateUser(userProfile);

          if (isRedirect && !sessionStorage.getItem(SESSION_KEYS.KEYCLOAK_LOGIN_TOAST_SHOWN)) {
            setShowLoginToast(true);
            sessionStorage.setItem(SESSION_KEYS.KEYCLOAK_LOGIN_TOAST_SHOWN, "true");
          }
        }

        if (sessionStorage.getItem(SESSION_KEYS.KEYCLOAK_LOGOUT_SESSION_KEY)) {
          setShowLogoutToast(true);
          sessionStorage.removeItem(SESSION_KEYS.KEYCLOAK_LOGOUT_SESSION_KEY);
        }
      } catch (err) {
        console.error("Failed to initialize Keycloak:", err);
        updateUser();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /* ------------------------------------------------------------------------
   * Toast Notifications
   * ------------------------------------------------------------------------ */
  useEffect(() => {
    if (!isLoading) {
      if (showLoginToast && user?.fullName) {
        toast.success(GENERAL_MESSAGES.LOGIN_SUCCESSFULLY(user.fullName));
      }
      if (showLogoutToast) toast.success(GENERAL_MESSAGES.LOGOUT_SUCCESSFULLY);
    }
  }, [isLoading, showLoginToast, showLogoutToast, user]);

  /* ------------------------------------------------------------------------
   * Auth Actions
   * ------------------------------------------------------------------------ */
  const login = () => keycloakService.login();
  const register = () => keycloakService.register();
  const logout = () =>
    keycloakService.logout({ redirectUri: window.location.origin });

  /* ------------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------------ */
  if (isLoading) return <Loader fullscreen />;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
