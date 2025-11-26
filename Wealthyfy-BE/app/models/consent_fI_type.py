from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Enum as SqlEnum
)
from sqlalchemy.orm import relationship
from enum import Enum
from app.config.database import Base


class FITypeEnum(str, Enum):
    """Enum to represent the types of Financial Information (FI) permissible by AA."""
    DEPOSIT = "DEPOSIT"
    TERM_DEPOSIT = "TERM_DEPOSIT"
    MUTUAL_FUNDS = "MUTUAL_FUNDS"
    ETF = "ETF"
    EQUITY_SHARES = "EQUITY_SHARES"

    @classmethod
    def from_string(cls, account_type_str: str) -> "FITypeEnum":
        """Map account type string to FITypeEnum. Returns DEPOSIT if unknown."""
        if not account_type_str:
            return cls.DEPOSIT
        
        # Normalize: uppercase, replace hyphens with underscores, strip whitespace
        normalized = account_type_str.strip().upper().replace("-", "_")
        
        # Try direct enum access
        try:
            return cls[normalized]
        except (KeyError, ValueError):
            return cls.DEPOSIT


class ConsentFITypeStatus(str, Enum):
    """Enum to represent the status of consent FI type."""
    ACTIVE = "ACTIVE"
    EXPIRE = "EXPIRE"


class ConsentFIType(Base):
    __tablename__ = "consent_fi_type"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    consent_request_id = Column(
        Integer,
        ForeignKey("consent_request.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )


    fi_type = Column(
        SqlEnum(FITypeEnum, name="fi_type_enum"),
        nullable=False,
        index=True
    )

    status = Column(
        SqlEnum(ConsentFITypeStatus, name="consent_fi_type_status_enum"),
        default=ConsentFITypeStatus.ACTIVE,
        nullable=False,
        index=True
    )

    consent_request = relationship(
        "ConsentRequest",
        back_populates="fi_types"
    )
