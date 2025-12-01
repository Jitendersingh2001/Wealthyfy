from pydantic import BaseModel, Field
from datetime import datetime
from app.models.consent_fI_type import FITypeEnum


class DepositAccountResponse(BaseModel):
    """Schema for deposit account response."""
    
    id: int = Field(..., description="Account ID")
    consent_id: int = Field(..., description="Consent request ID")
    fip_id: str = Field(..., description="Financial Institution Provider ID")
    link_ref_number: str = Field(..., description="Link reference number")
    masked_account_number: str | None = Field(None, description="Masked account number")
    account_type: FITypeEnum = Field(..., description="Account type (DEPOSIT or TERM_DEPOSIT)")
    created_at: datetime = Field(..., description="Account creation timestamp")

    class Config:
        from_attributes = True

