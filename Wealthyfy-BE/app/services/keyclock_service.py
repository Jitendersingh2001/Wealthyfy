import logging
from fastapi import HTTPException, status
from typing import Dict, Any, Optional
from keycloak import KeycloakOpenID, KeycloakAdmin
from app.schemas.user import UserCreate
from app.constants.message import Messages
from app.config.setting import settings
from app.utils.env_helper import EnvHelper
from app.constants.constant import ACTIVE

logger = logging.getLogger(__name__)


class KeycloakService:
    """Handles Keycloak operations: user management, authentication, and token validation."""

    def __init__(self):
        self.env = EnvHelper(settings.app.APP_ENV)
        self._verify_ssl = not self.env.is_dev

        """ 
            KeycloakOpenID is Used for authentication & authorization
            Works via OpenID Connect protocol    
        """
        self._openid = KeycloakOpenID(
            server_url=settings.keycloak.KEYCLOAK_URL,
            realm_name=settings.keycloak.KEYCLOAK_REALM,
            client_id=settings.keycloak.KEYCLOAK_CLIENT_ID,
            client_secret_key=settings.keycloak.KEYCLOAK_CLIENT_SECRET,
            verify=self._verify_ssl,
        )
        """ 
            KeycloakAdmin is Used for administrative operations
            Works via Keycloak Admin REST API
        """
        self._admin = KeycloakAdmin(
            server_url=settings.keycloak.KEYCLOAK_URL,
            realm_name=settings.keycloak.KEYCLOAK_REALM,
            client_id=settings.keycloak.KEYCLOAK_CLIENT_ID,
            client_secret_key=settings.keycloak.KEYCLOAK_CLIENT_SECRET,
            verify=self._verify_ssl,
        )

    # -----------------------------------------------------------------------
    def process_user(self, payload: Dict[str, Any]) -> Optional[UserCreate]:
        """
        Process a Keycloak user registration event payload.
        Handles both 'form' and 'broker' registration methods.
        """
        try:
            event_type = payload.get("type", "UNKNOWN")
            details = payload.get("details", {})
            user_id = payload.get("userId")
            register_method = details.get("register_method", "unknown")

            logger.info("Processing Keycloak event '%s' via '%s' method.", event_type, register_method)

            if register_method == "form":
                user_data = {
                    "keycloak_user_id": user_id,
                    "first_name": details.get("first_name"),
                    "last_name": details.get("last_name"),
                    "email": details.get("email"),
                    "email_verified": details.get("email_verified", False),
                }

            elif register_method == "broker":
                logger.info("Fetching user details for broker registration (userId=%s)", user_id)
                user_info = self.fetch_user_from_keycloak(user_id)
                user_data = {
                    "keycloak_user_id": user_id,
                    "first_name": user_info.get("firstName"),
                    "last_name": user_info.get("lastName"),
                    "email": user_info.get("email"),
                    "email_verified": user_info.get("emailVerified", False),
                }

            else:
                logger.warning("Unknown registration method: '%s'", register_method)
                return None

            logger.debug("Processed user data: %s", user_data)
            return UserCreate(**user_data)

        except Exception as e:
            logger.exception("Error processing Keycloak user event: %s", e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG,
            )

    # -----------------------------------------------------------------------
    def fetch_user_from_keycloak(self, user_id: str) -> Dict[str, Any]:
        """
        Fetch user details using the Keycloak Admin SDK.
        """
        try:
            user_info = self._admin.get_user(user_id)
            logger.debug("Fetched user info from Keycloak: %s", user_info)
            return user_info
        except Exception as e:
            logger.exception("Error fetching user from Keycloak: %s", e)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to fetch user from Keycloak: {str(e)}",
            )

    # -----------------------------------------------------------------------
    def get_keycloak_admin_token(self) -> str:
        """
        Retrieve an admin access token using the Keycloak SDK.
        """
        try:
            token_data = self._openid.token(grant_type="client_credentials")
            access_token = token_data.get("access_token")

            if not access_token:
                logger.error("Missing 'access_token' in Keycloak response: %s", token_data)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Missing access token in Keycloak response.",
                )

            logger.info("Successfully retrieved Keycloak admin token.")
            return access_token

        except Exception as e:
            logger.exception("Failed to fetch Keycloak admin token: %s", e)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to get Keycloak token: {str(e)}",
            )

    # -----------------------------------------------------------------------
    def get_authenticate(self, token: str) -> bool:
        """
        Validates an access token using the Keycloak SDK introspection endpoint.
        """
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=Messages.TOKEN_MISSING,
            )

        if token.startswith("Bearer "):
            token = token.split(" ", 1)[1]

        try:
            token_info = self._openid.introspect(token)

            if not token_info.get(ACTIVE):
                logger.warning("Inactive Keycloak token: %s", token_info)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=Messages.INVALID_TOKEN,
                )

            return token_info

        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Unexpected error validating token: %s", e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG,
            )
