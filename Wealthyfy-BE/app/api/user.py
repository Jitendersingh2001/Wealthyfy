from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas.user import UserResponse
from app.services.user_services import UserService
from app.dependencies.auth import authenticate_user

router = APIRouter(prefix="/users", tags=["User"])


@router.get("/get_user/{id}", response_model=UserResponse, dependencies=[Depends(authenticate_user)])
def get_user_by_id(id: str, db: Session = Depends(get_db)):
    """
    Fetch a user by their unique ID.
    Requires a valid Keycloak Bearer token.
    """
    user_service = UserService(db)
    return user_service.get_user_by_id(id)
