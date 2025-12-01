from pydantic import BaseModel, Field
from typing import Optional, List


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

