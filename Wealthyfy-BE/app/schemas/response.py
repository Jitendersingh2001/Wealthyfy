# app/schemas/response.py
from pydantic import BaseModel, ConfigDict
from typing import Any, Optional, Generic, TypeVar

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None

    # Pydantic v2 config
    model_config = ConfigDict(from_attributes=True)
