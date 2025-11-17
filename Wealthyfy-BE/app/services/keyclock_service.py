from fastapi import HTTPException, status
from typing import Dict, Any, Optional
from keycloak import KeycloakOpenID, KeycloakAdmin
from app.schemas.user import UserCreate
from app.constants.message import Messages
from app.config.setting import settings
from app.utils.env_helper import EnvHelper
from app.constants.constant import ACTIVE
from app.utils.logger_util import (
    logger_info, logger_debug, logger_warning, logger_error, logger_exception, logger_success
)


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

            logger_info(
                f"Processing Keycloak event '{event_type}' via '{register_method}' method",
                event_type=event_type,
                register_method=register_method
            )

            if register_method == "form":
                user_data = {
                    "keycloak_user_id": user_id,
                    "first_name": details.get("first_name"),
                    "last_name": details.get("last_name"),
                    "email": details.get("email"),
                    "email_verified": details.get("email_verified", False),
                }

            elif register_method == "broker":
                logger_info(
                    f"Fetching user details for broker registration",
                    user_id=user_id
                )
                user_info = self.fetch_user_from_keycloak(user_id)
                user_data = {
                    "keycloak_user_id": user_id,
                    "first_name": user_info.get("firstName"),
                    "last_name": user_info.get("lastName"),
                    "email": user_info.get("email"),
                    "email_verified": user_info.get("emailVerified", False),
                }

            else:
                logger_warning(
                    f"Unknown registration method: '{register_method}'",
                    register_method=register_method
                )
                return None

            logger_debug(f"Processed user data: {user_data}")
            return UserCreate(**user_data)

        except Exception as e:
            logger_exception(f"Error processing Keycloak user event: {e}")
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
            logger_debug(f"Fetched user info from Keycloak: {user_info}", user_id=user_id)
            return user_info
        except Exception as e:
            logger_exception(f"Error fetching user from Keycloak: {e}", user_id=user_id)
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
                logger_error(
                    f"Missing 'access_token' in Keycloak response: {token_data}",
                )
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Missing access token in Keycloak response.",
                )

            logger_success("Successfully retrieved Keycloak admin token")
            return access_token

        except Exception as e:
            logger_exception(f"Failed to fetch Keycloak admin token: {e}")
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
                logger_warning(f"Inactive Keycloak token: {token_info}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=Messages.INVALID_TOKEN,
                )

            return token_info

        except HTTPException:
            raise
        except Exception as e:
            logger_exception(f"Unexpected error validating token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG,
            )
