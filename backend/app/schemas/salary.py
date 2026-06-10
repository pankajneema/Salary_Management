from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, field_validator

class SalaryUpdate(BaseModel):
    new_amount: Decimal
    new_currency: str
    reason: Optional[str] = None

    @field_validator("new_amount")
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Salary must be greater than 0")
        return v

    @field_validator("new_currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper()

class SalaryHistoryOut(BaseModel):
    id: str
    old_amount: Decimal
    new_amount: Decimal
    old_currency: str
    new_currency: str
    reason: Optional[str]
    changed_at: datetime

    model_config = {"from_attributes": True}
