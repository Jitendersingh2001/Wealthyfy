from pydantic import BaseModel, Field, field_validator
from app.models.pancard import PancardStatus, ConsentEnum
from app.types.pan import PanCard


class VerifyPancardRequest(BaseModel):
    """Schema for verifying a user's PAN card with consent."""

    pancard: PanCard = Field(
        ...,
        description="Valid Indian PAN number. Format: 5 letters, 4 digits, 1 letter.",
        examples=["ABCDE1234F"]
    )
    consent: ConsentEnum = Field(
        ...,
        description="User consent for PAN verification. Allowed values: 'Y' or 'N'.",
        examples=["Y"]
    )

    @field_validator("consent", mode="before")
    def normalize_consent(cls, value):
        """Normalize consent input (Y/N) to uppercase before validation."""
        return value.upper() if isinstance(value, str) else value


class PanCardResponse(BaseModel):
    id: int
    pancard: str
    status: PancardStatus
    consent: ConsentEnum

    class Config:
        from_attributes = True
