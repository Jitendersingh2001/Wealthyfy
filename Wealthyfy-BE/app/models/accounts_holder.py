from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Integer,
    Boolean,
    Text,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base


# ---------------------------------------------------------------------------
# This model stores detailed information about each account holder associated
# with a financial account. Includes personal info, compliance details, and
# linkage to the FinancialAccount table.
# ---------------------------------------------------------------------------
class AccountHolder(Base):
    __tablename__ = "account_holders"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # References FinancialAccount.id (Integer)
    account_id = Column(
        Integer,
        ForeignKey("financial_accounts.id"),
        nullable=False,
        index=True
    )

    holder_type = Column(String(20), nullable=False)
    address = Column(Text)
    ckyc_compliance = Column(Boolean)
    date_of_birth = Column(DateTime)
    email = Column(String(255))
    mobile = Column(String(15))
    name = Column(String(255), nullable=False)
    nominee_status = Column(String(20))
    pan = Column(String(10))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationship to FinancialAccount
    account = relationship(
        "FinancialAccount",
        back_populates="holders"
    )
