import requests
import logging
from fastapi import HTTPException, status
from typing import Dict, Any, Optional
from app.models.user import User
from app.constants.message import Messages
from app.config.setting import settings
from app.schemas.user import UserCreate

logger = logging.getLogger(__name__)


class KeycloakService:
    """
    Handles interactions with Keycloak during user registration events.
    """

    def process_user(payload: Dict[str, Any]) -> Optional[User]:
        """
        Process a Keycloak user registration event payload.
        - For 'form' users, extract details directly.
        - For 'broker' users (e.g., Google), fetch details from Keycloak Admin API.
        """
        try:
            event_type = payload.get("type", "UNKNOWN")
            details = payload.get("details", {})
            user_id = payload.get("userId")
            register_method = details.get("register_method", "unknown")

            logger.info("Processing user event type: %s via method: %s", event_type, register_method)

            if register_method == "form":
                user_data = {
                    "keycloak_user_id": user_id,
                    "first_name": details.get("first_name"),
                    "last_name": details.get("last_name"),
                    "email": details.get("email"),
                    "email_verified": False,
                }

            elif register_method == "broker":
                logger.info("Fetching user details from Keycloak for broker registration.")
                user_info = KeycloakService.fetch_user_from_keycloak(user_id)
                user_data = {
                    "keycloak_user_id": user_id,
                    "first_name": user_info.get("firstName"),
                    "last_name": user_info.get("lastName"),
                    "email": user_info.get("email"),
                    "email_verified": user_info.get("emailVerified", False),
                }

            else:
                logger.warning("Unknown register method: %s", register_method)
                return None

            logger.info("Processed user data: %s", user_data)
            # You can replace this with ORM save logic, e.g.:
            # user = UserService.create_user(user_data)
            return UserCreate(**user_data)

        except Exception as e:
            logger.exception("Error processing Keycloak user event: %s", e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=Messages.SOMETHING_WENT_WRONG,
            )

    # -----------------------------------------------------------------------

    def get_keycloak_admin_token() -> str:
        """
        Retrieves an admin access token from Keycloak using the client credentials flow.
        This synchronous version uses 'requests' instead of 'httpx'.
        """
        token_url = (
            f"{settings.keycloak.KEYCLOAK_URL}/realms/"
            f"{settings.keycloak.KEYCLOAK_REALM}/protocol/openid-connect/token"
        )
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "client_id": settings.keycloak.KEYCLOAK_CLIENT_ID,
            "client_secret": settings.keycloak.KEYCLOAK_CLIENT_SECRET,
            "grant_type": "client_credentials",
        }
        logger.info(
            "Fetching Keycloak admin token.\nURL: %s\nPayload: %s",
            token_url,
            data
         )
        try:
            response = requests.post(token_url, headers=headers, data=data, timeout=10)
            logger.info("Response status code: %s", response.json())
            # response.raise_for_status()
            token_data = response.json()
            access_token = token_data.get("access_token")

            if not access_token:
                logger.error("Keycloak token missing 'access_token': %s", token_data)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Missing access token in Keycloak response.",
                )

            logger.info("✅ Successfully retrieved Keycloak admin token.")
            return access_token

        except requests.exceptions.RequestException as e:
            logger.exception("Error fetching Keycloak admin token: %s", e)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to connect to Keycloak: {str(e)}",
            )

    # -----------------------------------------------------------------------

    def fetch_user_from_keycloak(user_id: str) -> Dict[str, Any]:
        """
        Fetch user details from Keycloak using the Admin REST API.
        """
        try:
            access_token = KeycloakService.get_keycloak_admin_token()
            url = f"{settings.keycloak.KEYCLOAK_URL}/admin/realms/{settings.keycloak.KEYCLOAK_REALM}/users/{user_id}"

            headers = {"Authorization": f"Bearer {access_token}"}
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            user_info = response.json()
            logger.info("Fetched user info from Keycloak: %s", user_info)
            return user_info

        except requests.exceptions.RequestException as e:
            logger.exception("Error fetching user from Keycloak: %s", e)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to fetch user from Keycloak: {str(e)}",
            )
