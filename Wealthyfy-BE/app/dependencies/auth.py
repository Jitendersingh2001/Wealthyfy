from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.keyclock_service import KeycloakService
from app.constants.message import Messages


security = HTTPBearer(auto_error=True)

def authenticate_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to verify the Keycloak access token.
    Attaches the lock icon in Swagger and enforces Bearer authentication.
    """
    token = credentials.credentials
    keycloak = KeycloakService()
    is_valid = keycloak.get_authenticate(token)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=Messages.INVALID_TOKEN,
        )

    return True
