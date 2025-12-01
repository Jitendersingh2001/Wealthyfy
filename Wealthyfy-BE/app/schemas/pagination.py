from typing import Optional, Literal, Generic, TypeVar, List
from pydantic import BaseModel, Field

T = TypeVar('T')


class BasePaginationRequest(BaseModel):
    """Base schema for pagination request parameters."""
    page: int = Field(1, ge=1, description="Page number (1-indexed)")
    size: int = Field(10, ge=1, le=100, description="Page size (max 100)")
    sort_by: Optional[str] = Field(None, description="Field name to sort by")
    sort_order: Optional[Literal["asc", "desc"]] = Field("desc", description="Sort order: 'asc' or 'desc'")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response schema."""
    items: List[T] = Field(..., description="List of items in the current page")
    total: int = Field(..., description="Total number of items across all pages")
    page: int = Field(..., description="Current page number (1-indexed)")
    size: int = Field(..., description="Number of items per page")

