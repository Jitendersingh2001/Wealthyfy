from sqlalchemy import (
    Column, Integer, String, DateTime, Enum as SqlEnum, ForeignKey, JSON
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum
from app.config.database import Base

# Enums for consent status and fetch type
class ConsentStatus(Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"
    REJECTED = "REJECTED"
    PAUSED = "PAUSED"

class FetchType(Enum):
    ONETIME = "ONETIME"
    PERIODIC = "PERIODIC"

class UnitEnum(Enum):
    HOUR = "HOUR"
    DAY = "DAY"
    MONTH = "MONTH"
    YEAR = "YEAR"
    INF = "INF"


class ConsentRequest(Base):
    __tablename__ = "consent_request"

    id = Column(Integer, primary_key=True, index=True)

    # External consent ID from Setu
    consent_id = Column(String(50), unique=True, nullable=False, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pan_id = Column(Integer, ForeignKey("pancard.id", ondelete="CASCADE"), nullable=True)

    status = Column(SqlEnum(ConsentStatus), default=ConsentStatus.PENDING, nullable=False)
    consent_mode = Column(String(20), nullable=False)
    vua = Column(String(50), nullable=False, index=True)

    # Purpose fields
    purpose_code = Column(String(10), nullable=False)
    purpose_text = Column(String(255), nullable=False)
    purpose_ref_uri = Column(String(512), nullable=True)
    purpose_category_type = Column(String(100), nullable=True)

    fetch_type = Column(SqlEnum(FetchType), nullable=False)

    # Date and Duration fields
    data_range_from = Column(DateTime(timezone=True), nullable=True)
    data_range_to = Column(DateTime(timezone=True), nullable=True)
    consent_start = Column(DateTime(timezone=True), nullable=True)
    consent_expiry = Column(DateTime(timezone=True), nullable=True)

    data_life_unit = Column(SqlEnum(UnitEnum), nullable=False)
    data_life_value = Column(Integer, nullable=False)

    frequency_unit = Column(SqlEnum(UnitEnum), nullable=True)
    frequency_value = Column(Integer, nullable=True)

    # Metadata
    redirect_url = Column(String(512), nullable=True)
    trace_id = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)
    consent_types = Column(JSON, nullable=True)
    context = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    fi_types = relationship("ConsentFIType", back_populates="consent_request", cascade="all, delete-orphan")
    sessions = relationship("DataSession", back_populates="consent_request", cascade="all, delete-orphan")
    cancellation_logs = relationship("ConsentCancellationLog", back_populates="consent_request", cascade="all, delete-orphan")
