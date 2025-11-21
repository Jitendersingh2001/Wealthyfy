from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    Text,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base


class TermDepositDetails(Base):
    __tablename__ = 'term_deposit_details'
    
    summary_id = Column(Integer, ForeignKey('account_summaries.id'), primary_key=True)
    account_type = Column(String(50), nullable=False)
    current_value = Column(Numeric(15, 2), nullable=False)
    description = Column(Text)
    compounding_frequency = Column(String(50))
    interest_computation = Column(String(50))
    interest_on_maturity = Column(String(100))
    interest_payout = Column(String(50))
    interest_periodic_payout_amount = Column(Numeric(15, 2))
    interest_rate = Column(Numeric(5, 2), nullable=False)
    maturity_amount = Column(Numeric(15, 2))
    maturity_date = Column(DateTime(timezone=True))
    principal_amount = Column(Numeric(15, 2), nullable=False)
    recurring_amount = Column(Numeric(15, 2))
    recurring_deposit_day = Column(Integer)
    tenure_days = Column(Integer)
    tenure_months = Column(Integer)
    tenure_years = Column(Integer)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    summary = relationship("AccountSummary", back_populates="term_deposit_details")

