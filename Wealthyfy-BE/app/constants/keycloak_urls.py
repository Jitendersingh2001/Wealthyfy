# app/constants/keycloak_urls.py

from app.config.setting import settings

class KeycloakURLs:
    """
    Centralized Keycloak endpoint URLs for reuse across the application.
    """

    BASE_URL = settings.keycloak.KEYCLOAK_URL
    REALM = settings.keycloak.KEYCLOAK_REALM

    # Authentication and Token URLs
    TOKEN_URL = f"{BASE_URL}/realms/{REALM}/protocol/openid-connect/token"

    # Admin REST API URLs
    USERS_URL = f"{BASE_URL}/admin/realms/{REALM}/users"
    GROUPS_URL = f"{BASE_URL}/admin/realms/{REALM}/groups"
    ROLES_URL = f"{BASE_URL}/admin/realms/{REALM}/roles"

    @staticmethod
    def user_detail(user_id: str) -> str:
        """
        Returns the Keycloak Admin REST API endpoint for a specific user.
        """
        return f"{KeycloakURLs.USERS_URL}/{user_id}"
