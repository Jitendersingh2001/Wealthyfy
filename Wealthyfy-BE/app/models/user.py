from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SqlEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base
from enum import Enum
from app.constants import constant


class UserStatus(Enum):
    ACTIVE = constant.CAP_ACTIVE
    INACTIVE = constant.CAP_INACTIVE
    DELETED = constant.CAP_DELETED


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    keycloak_user_id = Column(String(50), unique=True,
                              index=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone_number = Column(
        String(20),
        unique=True,
        nullable=True,
        default=None
    )
    email_verified = Column(Boolean, default=False)
    is_setup_complete = Column(Boolean, default=False)
    status = Column(SqlEnum(UserStatus),
                    default=UserStatus.INACTIVE, nullable=False)

    created_at = Column(DateTime(timezone=True),
                        server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True),
                        onupdate=func.now(), nullable=True)

    # Relationship: One User → One Pancard (or optional)
    pancard = relationship("Pancard", back_populates="user", uselist=False)
