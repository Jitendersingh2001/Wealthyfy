from pydantic import BaseModel, Field
from app.types.phone import PhoneNumber


class SendOtpRequest(BaseModel):
    phone_number: PhoneNumber = Field(
        ...,
        description="Valid 10-digit Indian mobile number",
        examples=["9996624103"]
        )


class VerifyOtpRequest(BaseModel):
    phone_number: PhoneNumber = Field(
        ...,
        description="Valid 10-digit Indian mobile number",
        examples=["9996624103"]
        )
    otp: str = Field(
        ...,
        min_length=6,
        max_length=6,
        description="OTP must be exactly 6 digits.",
        examples=["0123456"]
    )
