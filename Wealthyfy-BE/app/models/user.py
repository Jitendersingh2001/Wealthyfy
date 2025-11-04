from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.config.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    keycloak_user_id = Column(String(50), unique=True, index=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    email_verified = Column(Boolean, default=False)
    is_setup_complete = Column(Boolean, default=False)

    # Automatically set timestamp when row is created
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Automatically update timestamp whenever row is updated
    updated_at = Column(DateTime, onupdate=func.now(), nullable=True)
