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


class BankTransaction(Base):
    __tablename__ = 'bank_transactions'
    
    id = Column(Integer, primary_key=True)
    account_id = Column(String(64), ForeignKey('financial_accounts.account_id'))
    amount = Column(Numeric(15, 2), nullable=False)
    balance = Column(Numeric(15, 2))
    mode = Column(String(20), nullable=False)
    narration = Column(Text)
    transaction_timestamp = Column(DateTime(timezone=True), nullable=False)
    transaction_id = Column(String(100), nullable=False)
    transaction_type = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    account = relationship("FinancialAccount", back_populates="transactions")

