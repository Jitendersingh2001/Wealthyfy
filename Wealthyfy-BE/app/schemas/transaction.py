from datetime import datetime
from pydantic import BaseModel, Field, field_serializer
from decimal import Decimal
from app.schemas.pagination import BasePaginationRequest


class TransactionPaginationRequest(BasePaginationRequest):
    """Schema for transaction pagination request."""
    account_id: int = Field(..., ge=1, description="Account ID to filter transactions")


class TransactionResponse(BaseModel):
    """Schema for transaction response using database field names."""
    
    id: int = Field(..., description="Transaction ID")
    account_id: int = Field(..., description="Account ID")
    amount: float = Field(..., description="Transaction amount")
    mode: str = Field(..., description="Transaction mode (UPI, NEFT, IMPS, RTGS, etc.)")
    transaction_timestamp: datetime = Field(..., description="Transaction timestamp")
    transaction_id: str = Field(..., description="Transaction identifier")
    transaction_type: str = Field(..., description="Transaction type (CREDIT or DEBIT)")

    @field_serializer('amount')
    def serialize_amount(self, value: Decimal | float) -> float:
        """Convert Decimal to float."""
        return float(value)

    @field_serializer('transaction_timestamp')
    def serialize_timestamp(self, value: datetime) -> str:
        """Convert datetime to ISO format string."""
        return value.isoformat()

    class Config:
        from_attributes = True
