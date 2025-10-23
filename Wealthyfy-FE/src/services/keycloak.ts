import Keycloak, {
    type KeycloakConfig,
    type KeycloakInitOptions,
    type KeycloakLoginOptions,
    type KeycloakRegisterOptions
} from "keycloak-js";
import { config } from "@/config/config";

class KeycloakService {
  private keycloak?: Keycloak;

  public async init(options?: KeycloakInitOptions): Promise<Keycloak> {
    if (!this.keycloak) {
      const kcConfig: KeycloakConfig = {
        url: config.keycloak.url,
        realm: config.keycloak.realm,
        clientId: config.keycloak.clientId
      };

      this.keycloak = new Keycloak(kcConfig);
    }

    try {
      await this.keycloak.init({
        onLoad: "check-sso",
        // silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        checkLoginIframe: false,
        pkceMethod: "S256",
        ...options
      });
    } catch (error) {
      console.error("Error initializing Keycloak", error);
    }

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

  public getToken(): string | undefined {
    return this.keycloak?.token;
  }

  public isAuthenticated(): boolean {
    return !!this.keycloak?.authenticated;
  }
}

export const keycloakService = new KeycloakService();
