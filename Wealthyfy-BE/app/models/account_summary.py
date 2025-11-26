from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Integer,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base


class AccountSummary(Base):
    __tablename__ = 'account_summaries'
    
    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey('financial_accounts.id'))
    branch = Column(String(255))
    ifsc_code = Column(String(20))
    opening_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    account = relationship("FinancialAccount", back_populates="summary")
    banking_details = relationship("BankingAccountDetails", back_populates="summary", uselist=False)
    term_deposit_details = relationship("TermDepositDetails", back_populates="summary", uselist=False)
