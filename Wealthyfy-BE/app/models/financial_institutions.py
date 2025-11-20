from sqlalchemy import Column, Integer, String, Enum, DateTime
from app.config.database import Base
from app.constants import constant
from enum import Enum as PyEnum
from sqlalchemy.sql import func


class FinancialInstitutionsStatusEnum(PyEnum):
    ACTIVE = constant.ACTIVE
    INACTIVE = constant.INACTIVE


class FinancialInstitutions(Base):
    __tablename__ = "financial_institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    fip_id = Column(String(255), nullable=False, unique=True, index=True)
    institution_type = Column(String(50), nullable=False)

    Status = Column(
        Enum(FinancialInstitutionsStatusEnum, name="financial_institutions_status_enum"),
        nullable=False,
        default=FinancialInstitutionsStatusEnum.ACTIVE,
        index=True
    )

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
