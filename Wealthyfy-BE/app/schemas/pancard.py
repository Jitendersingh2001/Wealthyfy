import re
from enum import Enum
from pydantic import BaseModel, Field, field_validator
from pydantic_core import PydanticCustomError
from app.constants.regex import PAN_REGEX
from app.models.pancard import PancardStatus, ConsentEnum

class VerifyPancardRequest(BaseModel):
    pancard: str = Field(..., description="Valid PAN (ABCDE1234F)", examples=[
                         "ABCDE1234F"])
    consent: ConsentEnum = Field(..., description="Consent Y/N")

    @field_validator("pancard")
    def validate_pan(cls, value):
        if not re.match(PAN_REGEX, value):
            raise PydanticCustomError(
                "invalid_pan",
                "Invalid PAN card format."
            )
        return value

    @field_validator("consent", mode="before")
    def normalize_consent(cls, value):
        return value.upper() if isinstance(value, str) else value

class PanCardResponse(BaseModel):
    id: int
    pancard: str
    status: PancardStatus
    consent: ConsentEnum

    class Config:
        from_attributes = True
