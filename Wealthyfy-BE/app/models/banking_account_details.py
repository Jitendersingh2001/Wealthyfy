from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base


class BankingAccountDetails(Base):
    __tablename__ = 'banking_account_details'
    
    summary_id = Column(Integer, ForeignKey('account_summaries.id'), primary_key=True)
    current_balance = Column(Numeric(15, 2), nullable=False)
    available_balance = Column(Numeric(15, 2))
    current_od_limit = Column(Numeric(15, 2))
    drawing_limit = Column(Numeric(15, 2))
    facility = Column(String(50))
    status = Column(String(50), nullable=False)
    account_sub_type = Column(String(50), nullable=False)
    currency = Column(String(10), default='INR')
    balance_date_time = Column(DateTime(timezone=True))
    micr_code = Column(String(20))
    pending_amount = Column(Numeric(15, 2))
    pending_transaction_type = Column(String(50))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    summary = relationship("AccountSummary", back_populates="banking_details")

