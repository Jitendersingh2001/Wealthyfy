from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Enum,
    Integer
)
from sqlalchemy.sql import func
from sqlalchemy.orm import validates
from app.config.database import Base
from app.models.consent_fI_type import FITypeEnum


class FinancialAccount(Base):
    __tablename__ = "financial_accounts"

    account_id = Column(String(64), primary_key=True, index=True)

    consent_id = Column(
        Integer,
        ForeignKey("consent_request.id"),
        index=True
    )

    fip_id = Column(
        String(100),
        ForeignKey("financial_institutions.fip_id"),
        index=True
    )

    link_ref_number = Column(String(64), index=True)

    masked_account_number = Column(String(50))

    account_type = Column(
        Enum(FITypeEnum),
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # ---------------------------------------------------------------
    # Auto-normalize account_type to UPPERCASE before DB insertion
    # ---------------------------------------------------------------
    @validates("account_type")
    def validate_account_type(self, _key, value):
        if isinstance(value, str):
            value = value.upper()

        try:
            # Ensure enum conversion is still strict and typed
            return FITypeEnum(value)
        except ValueError:
            raise ValueError(f"Invalid FITypeEnum value: {value}")
# ---------------------------------------------------------------