from pydantic import BaseModel, Field
from app.constants.regex import PAN_REGEX
from app.models.pancard import PancardStatus
class PancardRequest(BaseModel):
    pancard: str = Field(
        ...,
        pattern=PAN_REGEX,
        description="Valid PAN card number (ABCDE1234F format)"
    )

class PancardResponse(BaseModel):
    id: int
    user_id: int
    pancard: str
    status: PancardStatus

    class Config:
        from_attributes = True