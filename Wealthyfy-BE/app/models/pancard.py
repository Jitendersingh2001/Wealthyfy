from sqlalchemy import Column, Integer, String, DateTime, Enum as SqlEnum,ForeignKey
from sqlalchemy.sql import func
from enum import Enum
from app.config.database import Base
from app.constants import constant
from app.utils.encryption_helper import encrypt_value, decrypt_value
from sqlalchemy.orm import relationship


class PancardStatus(Enum):
    VERIFIED = constant.VERIFIED
    NOTVERIFIED = constant.NOTVERIFIED


class Pancard(Base):
    __tablename__ = "pancard"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False
    )

    # The actual encrypted column
    _pancard = Column("pancard", String(255),nullable=False)

    status = Column(SqlEnum(PancardStatus), default=PancardStatus.NOTVERIFIED, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationship: Pancard belongs to a User
    user = relationship("User", back_populates="pancard")

    @property
    def pancard(self) -> str:
        """Return decrypted PAN when accessed."""
        return decrypt_value(self._pancard)

    @pancard.setter
    def pancard(self, value: str):
        """Encrypt PAN before storing."""
        self._pancard = encrypt_value(value)
