from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.user import UserResponse
from app.schemas.pancard import PancardRequest,PancardResponse
from app.schemas.response import ApiResponse
from app.utils.response import success_response
from app.services.user_services import UserService
from app.dependencies.auth import authenticate_user
from app.constants.message import Messages

router = APIRouter(prefix="/users", tags=["User"])


@router.get(
    "/get_user/{id}",
    response_model=ApiResponse[UserResponse],
    dependencies=[Depends(authenticate_user)]
)
def get_user_by_id(
    id: str,
    db: Session = Depends(get_db)
):
    """
    Fetch a user by their unique ID.
    Requires a valid Keycloak Bearer token.
    """
    user_service = UserService(db)
    user = user_service.get_user_by_id(id)
    return success_response(
        data=user,
        message=Messages.FETCH_SUCCESSFULLY.replace(":name", "User")
    )


@router.post(
    "/pancard",
    response_model=ApiResponse[PancardResponse],
    dependencies=[Depends(authenticate_user)]
)
def add_user_pancard(
    payload: PancardRequest,
    db: Session = Depends(get_db),
    current_user=Depends(authenticate_user)
):
    """
    Add or update the PAN card of the current user.
    Requires a valid Keycloak Bearer token.
    """
    user_service = UserService(db)
    result = user_service.add_user_pancard(
        user_id=current_user.id,
        pancard=payload.pancard
    )
    return success_response(
        data=result,
        message=Messages.CREATED_SUCCESSFULLY.replace(":name", "PAN card")
    )