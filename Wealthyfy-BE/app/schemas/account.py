from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AccountHolderResponse(BaseModel):
    """Schema for account holder - only name field needed."""
    
    name: str = Field(..., description="Holder name")

    class Config:
        from_attributes = True


class DepositAccountResponse(BaseModel):
    """Schema for deposit account response - only essential fields."""
    
    id: int = Field(..., description="Account ID")
    masked_account_number: Optional[str] = Field(None, description="Masked account number")
    holders: List[AccountHolderResponse] = Field(default_factory=list, description="Account holders (name only)")

    class Config:
        from_attributes = True


class AccountDetailsResponse(BaseModel):
    """Schema for account details response with comprehensive information."""
    
    holder_type: Optional[str] = Field(None, description="Account holder type")
    ckyc_compliance: Optional[bool] = Field(None, description="CKYC compliance status")
    date_of_birth: Optional[datetime] = Field(None, description="Date of birth")
    email: Optional[str] = Field(None, description="Email address")
    mobile: Optional[str] = Field(None, description="Mobile number")
    nominee_status: Optional[str] = Field(None, description="Nominee status")
    pan: Optional[str] = Field(None, description="PAN number")
    branch: Optional[str] = Field(None, description="Branch name")
    ifsc_code: Optional[str] = Field(None, description="IFSC code")

    class Config:
        from_attributes = True

