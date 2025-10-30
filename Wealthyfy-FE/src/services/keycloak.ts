import Keycloak, {
  type KeycloakConfig,
  type KeycloakInitOptions,
  type KeycloakLoginOptions,
  type KeycloakRegisterOptions,
} from "keycloak-js";
import { config } from "@/config/config";

class KeycloakService {
  private keycloak?: Keycloak;
  private initialized = false;
  private initPromise?: Promise<Keycloak>;

  public async init(options?: KeycloakInitOptions): Promise<Keycloak> {

    if (this.initialized && this.keycloak) {
      return this.keycloak;
    }

    // If initialization is already running, return that same promise
    if (this.initPromise) {
      return this.initPromise;
    }

    const kcConfig: KeycloakConfig = {
      url: config.keycloak.url,
      realm: config.keycloak.realm,
      clientId: config.keycloak.clientId,
    };

    this.keycloak ??= new Keycloak(kcConfig);

    this.initPromise = this.keycloak
      .init({
        onLoad: "check-sso",
        checkLoginIframe: false,
        pkceMethod: "S256",
        ...options,
      })
      .then(() => {
        this.initialized = true;
        return this.keycloak!;
      })
      .catch((error) => {
        console.error("[KeycloakService] Error initializing Keycloak", error);
        throw error;
      })
      .finally(() => {
        this.initPromise = undefined; // clear after completion
      });

    return this.initPromise;
  }

  public getKeycloakInstance(): Keycloak | undefined {
    return this.keycloak;
  }

  public login(options?: KeycloakLoginOptions): Promise<void> {
    if (!this.keycloak) {
      return Promise.reject(new Error("Keycloak not initialized"));
    }
    sessionStorage.setItem("kc_login_initiated", "true");
    return this.keycloak.login(options);
  }

  public register(options?: KeycloakRegisterOptions): Promise<void> {
    if (!this.keycloak) {
      return Promise.reject(new Error("Keycloak not initialized"));
    }
    return this.keycloak.register(options);
  }

  public async logout(options?: { redirectUri?: string }): Promise<void> {
    if (!this.keycloak) {
      return Promise.reject(new Error("Keycloak not initialized"));
    }
    sessionStorage.setItem("kc_logout_initiated", "true");
    return this.keycloak.logout(options);
  }

  public getToken(): string | undefined {
    return this.keycloak?.token;
  }

  public isAuthenticated(): boolean {
    return !!this.keycloak?.authenticated;
  }
}

export const keycloakService = new KeycloakService();
