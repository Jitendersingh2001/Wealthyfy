from pydantic import BaseModel, EmailStr
from datetime import datetime

# Request schema (for creating a user)
class UserCreate(BaseModel):
    keycloak_user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    email_verified: bool = False

# Response schema (for returning user info)
class UserResponse(BaseModel):
    id: int
    keycloak_user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    created_at: datetime
    email_verified: bool

    class Config:
        from_attributes = True  # Enable ORM mode