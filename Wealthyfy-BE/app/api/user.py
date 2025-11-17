from fastapi import APIRouter, status, Depends, Response
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas.user import UserResponse, CreateUserPanAndPhoneRequest
from app.schemas.response import ApiResponse
from app.utils.response import success_response, error_response
from app.services.user_services import UserService
from app.dependencies.auth import authenticate_user
from app.constants.message import Messages
from app.schemas.pancard import VerifyPancardRequest, PanCardResponse
from app.models.pancard import Pancard, ConsentEnum
from app.services.setu_service import SetuService
from app.services.twillo_service import TwilioService
from app.schemas.otp import SendOtpRequest, VerifyOtpRequest
from app.constants.constant import PENDING
from app.schemas.setu import LinkBankRequest
from app.utils.helper import to_utc_z_format

# ---------------------------------------------------------------------------
# Router Configuration
# ---------------------------------------------------------------------------
router = APIRouter(
    prefix="/users",
    tags=["User"]
)


# ===========================================================================
# Get User By ID
# ===========================================================================
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
    Retrieves user details by Keycloak user ID.
    Authentication is required.
    """
    user_service = UserService(db)
    user = user_service.get_user_by_id(id)

    return success_response(
        data=user,
        message=Messages.FETCH_SUCCESSFULLY.replace(":name", "User")
    )


# ===========================================================================
# Create / Update PAN Card and Phone Number
# ===========================================================================
@router.post(
    "/create_pan_and_phone_no",
    response_model=ApiResponse
)
def update_pan_and_phone_no(
    payload: CreateUserPanAndPhoneRequest,
    db: Session = Depends(get_db),
    current_user=Depends(authenticate_user)
):
    """
    Saves or updates user's PAN card and phone number.
    Requires user authentication.
    """
    user_service = UserService(db)

    pancard = user_service.add_or_update_user_pancard(
        user_id=current_user.id,
        pancard=payload.pancard,
        consent=payload.consent,
        pancard_id=payload.pancard_id
    )

    phone_number = user_service.update_user_phone_no(
        id=current_user.id,
        phone_number=payload.phone_number
    )

    result = bool(pancard) and bool(phone_number)

    return success_response(
        data=result,
        message=Messages.CREATED_SUCCESSFULLY.replace(
            ":name", "Pan card and Mobile Number")
    )


# ===========================================================================
# Verify PAN Card
# ===========================================================================
@router.post(
    "/verify_pancard",
    response_model=ApiResponse,
    dependencies=[Depends(authenticate_user)]
)
def verify_user_pancard(
    payload: VerifyPancardRequest,
    db: Session = Depends(get_db),
):
    """
    Validates the user's PAN card using Setu API.
    Ensures that consent is provided and PAN does not already exist.
    """
    pancard = payload.pancard
    consent = payload.consent.upper()

    # Check if PAN already stored
    if Pancard.exists(db, pancard):
        return error_response(
            message=Messages.ALREADY_EXIST.replace(":name", "Pan card"),
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT
        )

    # Ensure consent is granted
    if consent == ConsentEnum.NO:
        return error_response(
            message=Messages.IS_REQUIRED.replace(":name", "Consent")
        )

    # Call Setu verification service
    setu_service = SetuService()
    is_valid = setu_service.verify_pancard(pancard, consent)

    if not is_valid:
        return error_response(
            message=Messages.IS_NOT_VALID.replace(":name", "Pan card")
        )

    # PAN is valid
    return success_response(
        data=Messages.IS_VALID.replace(":name", "Pan card")
    )

# ===========================================================================
# get user PAN Card
# ===========================================================================


@router.get(
    "/pancard",
    response_model=ApiResponse[PanCardResponse],
    responses={
        204: {"description": "No PAN card found"},
    }
)
def get_pancard(
    db: Session = Depends(get_db),
    current_user=Depends(authenticate_user),
):
    user_service = UserService(db)
    pancard = user_service.get_pancard(current_user.id)

    if pancard is None:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return success_response(
        data=PanCardResponse.model_validate(pancard),
        message=Messages.FETCH_SUCCESSFULLY.replace(":name", "Pan card"),
    )

# ===========================================================================
# SEND OTP TO USER'S PHONE NUMBER
# ===========================================================================


@router.post(
    "/send-otp",
    response_model=ApiResponse,
    dependencies=[Depends(authenticate_user)]
)
def send_otp(payload: SendOtpRequest):
    """
    Sends an OTP to the specified phone number using Twilio Verify service.
    """
    twillo_service = TwilioService()
    result = twillo_service.send_otp(phone_number=payload.phone_number)
    if result == PENDING:
        return success_response(
            data=result,
            message=Messages.SENT_SUCCESSFULLY.replace(":name", "OTP"),
        )
    return error_response(
        message=Messages.FAILED_TO_SEND_OTP
    )

# ===========================================================================
# VERIFY OTP
# ===========================================================================


@router.post(
    "/verify-otp",
    response_model=ApiResponse,
    dependencies=[Depends(authenticate_user)]
)
def verify_otp(payload: VerifyOtpRequest):
    """
    Verifies the OTP received on the user's phone using Twilio Verify API.
    """
    twillo_service = TwilioService()
    result = twillo_service.verify_otp(payload.phone_number, payload.otp)

    if result is True:
        return success_response(
            data=result,
            message=Messages.VERIFIED_SUCCESSFULLY.replace(":name", "OTP"),
        )

    return error_response(
        message=Messages.INVALID_OR_EXPIRED_OTP
    )

# ===========================================================================
# LINK BANK
# ===========================================================================
@router.post(
    "/link-bank",
    response_model=ApiResponse
)
def link_bank(
    payload: LinkBankRequest,
    db: Session = Depends(get_db),
    current_user=Depends(authenticate_user)
):
    pancard = current_user.pancard.pancard
    pancard_id = current_user.pancard.id
    data_start_date = to_utc_z_format(payload.start_date)
    data_end_date = to_utc_z_format(payload.end_date)

    setu_service = SetuService()
    consent_data = setu_service.create_consent(
            phone_number=current_user.phone_number,
            pancard=pancard,
            start_date=data_start_date,
            end_date=data_end_date,
            fi_type=payload.fi_type,
            consent_duration=payload.consent_duration,
            fetch_type=payload.fetch_type,
            frequency=payload.frequency
        )
    
    # Only create consent request if URL is present in response
    consent_request_id = None
    if consent_data.get("url"):
        # Create user service instance
        user_service = UserService(db)
        
        # Check and expire existing pending consents for the user
        user_service.expire_pending_consents(user_id=current_user.id)
        
        # Create consent request
        consent_request = user_service.create_consent_request(
            user_id=current_user.id,
            pan_id=pancard_id,
            consent_data=consent_data
        )
        
        # Store consent request primary key ID for response
        consent_request_id = consent_request.id
        
        # Create consent FI types
        detail = consent_data.get("detail", {})
        fi_types = detail.get("fiTypes", [])
        if fi_types:
            user_service.create_consent_fi_types(
                consent_request_id=consent_request.id,
                fi_types=fi_types
            )
        else:
            # Commit the consent request even if there are no FI types
            db.commit()
    
    return success_response(
            data={
                "url": consent_data.get("url"),
                "consent_request_id": consent_request_id
            },
            message=Messages.CREATED_SUCCESSFULLY.replace(":name", "Consent"),
        )
