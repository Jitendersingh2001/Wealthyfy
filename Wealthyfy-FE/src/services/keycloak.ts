import Keycloak, {
  type KeycloakConfig,
  type KeycloakInitOptions,
  type KeycloakLoginOptions,
  type KeycloakRegisterOptions,
} from "keycloak-js";
import { config } from "@/config/config";
import { SESSION_KEYS } from "@/constants/sessionKeys";

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
    sessionStorage.setItem(SESSION_KEYS.KEYCLOAK_LOGOUT_SESSION_KEY, "true");
    return this.keycloak.logout(options);
  }

  public getToken(): string | undefined {
    return this.keycloak?.token;
  }

  public isAuthenticated(): boolean {
    return !!this.keycloak?.authenticated;
  }

  public isLoginRedirect(): boolean {
    const url = new URL(window.location.href);
    const fragmentParams = new URLSearchParams(url.hash.substring(1));
    const code = fragmentParams.get("code");
    const state = fragmentParams.get("state");

    return code && state ? true : false;
  }

  public async getValidToken(
    minValidity: number = 60
  ): Promise<string | undefined> {
    if (!this.keycloak) return undefined;

    try {
      // Refresh the token if it will expire soon
      await this.keycloak.updateToken(minValidity);
      return this.keycloak.token;
    } catch (err) {
      console.warn(
        "[KeycloakService] Token refresh failed. Redirecting to login.",err
      );
      this.logout({ redirectUri: window.location.origin });
      return undefined;
    }
  }
}

export const keycloakService = new KeycloakService();
