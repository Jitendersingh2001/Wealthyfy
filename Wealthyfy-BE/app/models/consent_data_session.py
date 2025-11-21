from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Enum as SqlEnum,
    JSON
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum
from app.config.database import Base


class DataSessionStatusEnum(str, Enum):
    """Enum to represent the combined data fetch session states as per Setu AA notifications."""
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"
    FAILED = "FAILED"


class DataSession(Base):
    __tablename__ = "consent_data_session"

    # Internal primary key for this data session
    id = Column(Integer, primary_key=True, index=True)

    # Setu external session ID (unique per Setu session)
    session_id = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        comment="External Setu session identifier"
    )

    # Foreign key to corresponding consent request
    consent_request_id = Column(
        Integer,
        ForeignKey("consent_request.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Combined status of the data session
    status = Column(
        SqlEnum(DataSessionStatusEnum, name="data_session_status_enum"),
        nullable=False,
        index=True
    )

    # Data range for the session
    data_range_from = Column(DateTime(timezone=True), nullable=True)
    data_range_to = Column(DateTime(timezone=True), nullable=True)

    # Metadata tracking
    last_fetched_at = Column(DateTime(timezone=True), nullable=True)
    usage_count = Column(Integer, default=0)
    consent_file_path = Column(
        String(255),
        nullable=True,
        comment="Path to the stored consent file, if applicable"
    )

    # Audit fields
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True
    )

    # Parent relationship
    consent_request = relationship(
        "ConsentRequest",
        back_populates="sessions"
    )
