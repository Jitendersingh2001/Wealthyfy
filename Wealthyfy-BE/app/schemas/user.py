from pydantic import BaseModel, EmailStr
from datetime import datetime

# Request schema (for creating a user)
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

# Response schema (for returning user info)
class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode