from fastapi import APIRouter, status ,Depends
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas.user import UserResponse, CreateUserPanAndPhoneRequest
from app.schemas.response import ApiResponse
from app.utils.response import success_response, error_response
from app.services.user_services import UserService
from app.dependencies.auth import authenticate_user
from app.constants.message import Messages
from app.schemas.pancard import VerifyPancardRequest,ConsentEnum
from app.models.pancard import Pancard
from app.services.setu_service import SetuService

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
    "/create_pan_and_phone_no",
    response_model=ApiResponse
)
def update_pan_and_phone_no(
    payload:CreateUserPanAndPhoneRequest,
    db: Session = Depends(get_db),
    current_user=Depends(authenticate_user)
):
    user_service = UserService(db)

    pancard = user_service.add_or_update_user_pancard(
        user_id=current_user.id,
        pancard=payload.pancard
    )

    phone_number = user_service.update_user_phone_no(
        id=current_user.id,
        phone_number=payload.phone_number
    )

    result = bool(pancard) and bool(phone_number)
    return success_response(
        data=result,
        message=Messages.CREATED_SUCCESSFULLY.replace(":name", "Phone No and Pan card")
    )

@router.post(
    "/verify_pancard",
    response_model=ApiResponse,
    dependencies=[Depends(authenticate_user)]
)
def verify_user_pancard(
    payload: VerifyPancardRequest,
    db: Session = Depends(get_db),
):
    pancard = payload.pancard
    consent = payload.consent.upper()

    # Check if PAN already exists
    if Pancard.exists(db, pancard):
        return error_response(
            message=Messages.ALREADY_EXIST.replace(":name", "Pan card"),
            status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
        )

    # Validate consent
    if consent == ConsentEnum.NO:
        return error_response(
            message=Messages.IS_REQUIRED.replace(":name", "Consent")
        )

    # Call Setu service
    setu_service = SetuService()
    is_valid = setu_service.verify_pancard(pancard, consent)

    if not is_valid:
        return error_response(
            message=Messages.IS_NOT_VALID.replace(":name", "Pan card")
        )

    # When valid
    return success_response(
        data=Messages.IS_VALID.replace(":name", "Pan card")
    )
