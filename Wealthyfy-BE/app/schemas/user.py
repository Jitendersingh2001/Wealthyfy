from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.constants.constant import INACTIVE
from app.types.phone import PhoneNumber
from app.types.pan import PanCard


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
    """Schema for verifying PAN and phone number during user onboarding."""

    phone_number: PhoneNumber = Field(
        ...,
        description="Valid 10-digit Indian mobile number",
        examples=["9876543210"]
    )
    pancard: PanCard = Field(
        ...,
        description="Valid Indian PAN in the format: 5 letters, 4 digits, 1 letter).",
        examples=["ABCDE1234F"]
    )
    consent: str = Field(
        ...,
        description="User consent for PAN verification. Must be 'Y' (Yes) or 'N' (No).",
        examples=["Y"]
    )
    pancard_id: Optional[str] = Field(
        default=None,
        description="Unique identifier for an existing PAN card record (used during updates).",
        examples=["123"]
    )
