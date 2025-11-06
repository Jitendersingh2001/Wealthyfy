from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.constants.constant import INACTIVE
from typing import Optional



# Request schema (for creating a user)
class UserCreate(BaseModel):
    keycloak_user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    email_verified: bool = False
    is_setup_complete: bool = False
    status: str = INACTIVE

# Response schema (for returning user info)
class UserResponse(BaseModel):
    id: int
    keycloak_user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    created_at: datetime
    email_verified: bool
    is_setup_complete: bool
    status : str
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True  # Enable ORM mode