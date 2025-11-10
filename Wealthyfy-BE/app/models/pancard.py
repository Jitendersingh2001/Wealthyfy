from sqlalchemy import Column, Integer, String, DateTime, Enum as SqlEnum, ForeignKey
from sqlalchemy.sql import func
from enum import Enum
from sqlalchemy.orm import relationship
import hashlib

from app.config.database import Base
from app.constants import constant
from app.utils.encryption_helper import encrypt_value, decrypt_value


class PancardStatus(Enum):
    VERIFIED = constant.VERIFIED
    NOTVERIFIED = constant.NOTVERIFIED


def _hash_pan(value: str) -> str:
    """Return deterministic SHA-256 hash of PAN."""
    return hashlib.sha256(value.upper().encode()).hexdigest()


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

    # Encrypted PAN storage
    _pancard = Column("pancard", String(255), nullable=False)

    # Deterministic hash for uniqueness checks
    pancard_hash = Column(String(64), unique=True, index=True, nullable=False)

    status = Column(
        SqlEnum(PancardStatus),
        default=PancardStatus.VERIFIED,
        nullable=False
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    user = relationship("User", back_populates="pancard")

    @property
    def pancard(self) -> str:
        """Return decrypted PAN when accessed."""
        return decrypt_value(self._pancard)

    @pancard.setter
    def pancard(self, value: str):
        """Encrypt PAN and also store a stable lookup hash."""
        self._pancard = encrypt_value(value)
        self.pancard_hash = _hash_pan(value)

    @classmethod
    def exists(cls, db, pancard_value: str) -> bool:
        """
        Check if a PAN already exists in the database.
        Uses deterministic hash for secure & accurate lookup.
        """
        hashed = _hash_pan(pancard_value)
        return db.query(cls).filter(cls.pancard_hash == hashed).first() is not None
