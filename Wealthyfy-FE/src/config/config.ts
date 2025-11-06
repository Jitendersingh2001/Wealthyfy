// config.ts
export const config = {
  keycloak: {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  },
};
