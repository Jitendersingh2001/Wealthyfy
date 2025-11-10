from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.keyclock_service import KeycloakService
from app.services.user_services import UserService
from app.config.database import get_db
from app.models.user import User
from sqlalchemy.orm import Session
from app.constants.message import Messages

security = HTTPBearer(auto_error=True)

def authenticate_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Validates the Keycloak token and returns the authenticated user object.
    """
    token = credentials.credentials
    keycloak = KeycloakService()

    token_data = keycloak.get_authenticate(token)
    
    keycloak_user_id = token_data.get("sub")

    user_service = UserService(db)
    user = user_service.get_user_by_id(keycloak_user_id)

    return user
