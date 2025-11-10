from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from app.constants.constant import INACTIVE
from app.constants.regex import PHONE_NO_REGEX, PAN_REGEX

class UserCreate(BaseModel):
    keycloak_user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    email_verified: bool = False
    is_setup_complete: bool = False
    status: str = INACTIVE


class UserResponse(BaseModel):
    id: int
    keycloak_user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    created_at: datetime
    email_verified: bool
    is_setup_complete: bool
    status: str
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True

class CreateUserPanAndPhoneRequest(BaseModel):
    phone_number: str = Field(
        ...,
        pattern=PHONE_NO_REGEX,
        description="Valid 10-digit mobile number"
    )
    pancard: str = Field(
        ...,
        pattern=PAN_REGEX,
        description="Valid PAN card number (ABCDE1234F format)"
    )