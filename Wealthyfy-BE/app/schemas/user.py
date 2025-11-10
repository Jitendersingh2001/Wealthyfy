import re
from datetime import datetime
from typing import Optional
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic_core import PydanticCustomError

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
        description="Valid 10-digit mobile number",
        examples=["9876543210"] 
    )
    pancard: str = Field(
        ...,
        description="Valid PAN card number (ABCDE1234F format)",
        examples=["ABCDE1234F"]
    )

    @field_validator("phone_number")
    def validate_phone(cls, value):
        if not re.match(PHONE_NO_REGEX, value):
            raise PydanticCustomError(
                "invalid_phone_number",
                "Invalid phone number format. Must be a 10-digit Indian mobile number."
            )
        return value

    @field_validator("pancard")
    def validate_pan(cls, value):
        if not re.match(PAN_REGEX, value):
            raise PydanticCustomError(
                "invalid_pan",
                "Invalid PAN card format. Expected: ABCDE1234F"
            )
        return value
