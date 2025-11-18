import React, {
  createContext,
  useEffect,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import { keycloakService } from "@/services/keycloak";
import { toast } from "sonner";
import Loader from "@/components/ui/loader";
import { GENERAL_MESSAGES, ERROR_MESSAGES } from "@/constants/messages";
import { SESSION_KEYS } from "@/constants/sessionKeys";
import { userService } from "@/services/userService";
import { getErrorMessage } from "@/utils/errorHelper";
import type { UserResponse } from "@/types/user";
import { pusherService } from "@/services/pusher";

/* -------------------------------- Types ----------------------------------- */

interface UserProfile {
  id: number;
  keycloakUserId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  createdAt: string;
  emailVerified: boolean;
  isSetupComplete: boolean;
  status: string;
  phoneNumber: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user?: UserProfile;
  isLoading: boolean;
  isSetupComplete: boolean;
  login: () => void;
  register: () => void;
  logout: () => void;
}

/* ----------------------------- Context Setup ------------------------------ */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* --------------------------- Helper Functions ----------------------------- */
const mapUserResponse = (data: UserResponse): UserProfile => ({
  id: data.id,
  keycloakUserId: data.keycloak_user_id,
  firstName: data.first_name,
  lastName: data.last_name,
  fullName: `${data.first_name} ${data.last_name}`,
  email: data.email,
  createdAt: data.created_at,
  emailVerified: data.email_verified,
  isSetupComplete: data.is_setup_complete,
  status: data.status,
  phoneNumber: data.phone_number ?? null,
});

/* ----------------------------- Provider ----------------------------------- */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile>();
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const updateUserState = useCallback((profile?: UserProfile) => {
    setIsAuthenticated(Boolean(profile));
    setUser(profile);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const isRedirectFromLogin = keycloakService.isLoginRedirect();
        await keycloakService.init();

        const kc = keycloakService.getKeycloakInstance();
        const userId = kc?.idTokenParsed?.sub;

        if (kc?.authenticated && userId) {
          try {
            const response = await userService.getUserById(userId);
            const mappedUser = mapUserResponse(response.data);

            updateUserState(mappedUser);

            // Setup completion state
            setIsSetupComplete(
              Boolean(mappedUser.phoneNumber && mappedUser.isSetupComplete)
            );

            // Subscribe to Pusher channel for user events
            try {
              await pusherService.subscribe(mappedUser.id);
            } catch (error) {
              console.error("Failed to subscribe to Pusher channel:", error);
              // Don't block login if Pusher subscription fails
            }

            // Login toast
            if (
              isRedirectFromLogin &&
              !sessionStorage.getItem(SESSION_KEYS.KEYCLOAK_LOGIN_TOAST_SHOWN)
            ) {
              toast.success(GENERAL_MESSAGES.LOGIN_SUCCESSFULLY(mappedUser.fullName));
              sessionStorage.setItem(
                SESSION_KEYS.KEYCLOAK_LOGIN_TOAST_SHOWN,
                "true"
              );
            }
          } catch (error) {
            console.error("User fetch failed:", error);
            toast.error(getErrorMessage(error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
            updateUserState();
          }
        } else {
          updateUserState();
          sessionStorage.removeItem(SESSION_KEYS.KEYCLOAK_LOGIN_TOAST_SHOWN);
          // Unsubscribe from Pusher when not authenticated
          await pusherService.unsubscribe();
          pusherService.disconnect();
        }

        // Logout message handling
        if (sessionStorage.getItem(SESSION_KEYS.KEYCLOAK_LOGOUT_SESSION_KEY)) {
          toast.success(GENERAL_MESSAGES.LOGOUT_SUCCESSFULLY);
          sessionStorage.removeItem(SESSION_KEYS.KEYCLOAK_LOGOUT_SESSION_KEY);
        }
      } catch (error) {
        console.error("Keycloak initialization failed:", error);
        updateUserState();
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Cleanup function to unsubscribe and disconnect on unmount
    return () => {
      pusherService.unsubscribe().catch(console.error);
      pusherService.disconnect();
    };
  }, [updateUserState]);

  /* ----------------------------- Auth Actions ----------------------------- */
  const login = () => keycloakService.login();
  const register = () => keycloakService.register();
  const logout = async () => {
    // Unsubscribe from Pusher and disconnect before logout
    await pusherService.unsubscribe();
    pusherService.disconnect();
    keycloakService.logout({ redirectUri: window.location.origin });
  };

  if (isLoading) return <Loader fullscreen />;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, isSetupComplete, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
