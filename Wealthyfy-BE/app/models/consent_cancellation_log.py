from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Enum as SqlEnum
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base
from enum import Enum

class CancelledBy(Enum):
    USER = "USER"
    SYSTEM = "SYSTEM"


class ConsentCancellationLog(Base):
    __tablename__ = "consent_cancellation_log"

    id = Column(Integer, primary_key=True)
    consent_request_id = Column(Integer, ForeignKey("consent_request.id", ondelete="CASCADE"), nullable=False)
    
    # Reason for cancellation (required)
    reason = Column(String(500), nullable=False)
    
    # User or System
    cancelled_by = Column(SqlEnum(CancelledBy), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationship back to the ConsentRequest model
    consent_request = relationship("ConsentRequest", back_populates="cancellation_logs")
