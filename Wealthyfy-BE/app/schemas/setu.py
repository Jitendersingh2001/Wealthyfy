from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class LinkBankRequest(BaseModel):
    start_date: datetime = Field(
        ..., 
        description="Consent data range start",
        example="2023-01-01"
    )
    end_date: datetime = Field(
        ..., 
        description="Consent data range end",
        example="2024-01-01"
    )
    fi_type: List[str] = Field(
        ..., 
        description="List of FI types",
        example=["DEPOSIT", "TERM_DEPOSIT", "MUTUAL_FUNDS","EQUITIES","ETF"]
    )
    consent_duration: Dict[str, str] = Field(
        ..., 
        description="Duration object",
        example={"unit": "YEAR|MONTH|DAY", "value": "1"}
    )
    fetch_type: str = Field(
        ..., 
        description="ONETIME or PERIODIC",
        example="ONETIME|PERIODIC"
    )
    frequency: Optional[Dict[str, str]] = Field(
        None,
        description="Frequency object (only for PERIODIC fetch)",
        example={"unit": "YEAR|MONTH|DAY", "value": "15"}
    )
