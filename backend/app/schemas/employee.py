from __future__ import annotations
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, field_validator

VALID_EMPLOYMENT_TYPES = {"full-time", "part-time", "contract"}

class EmployeeBase(BaseModel):
    full_name: str
    job_title: str
    department_id: str
    employment_type: str
    country: str
    salary_amount: Decimal
    currency: str
    date_of_joining: date

    @field_validator("employment_type")
    @classmethod
    def validate_employment_type(cls, v: str) -> str:
        if v.lower() not in VALID_EMPLOYMENT_TYPES:
            raise ValueError(f"employment_type must be one of {VALID_EMPLOYMENT_TYPES}")
        return v.lower()

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper()

    @field_validator("salary_amount")
    @classmethod
    def validate_salary(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("salary_amount must be greater than 0")
        return v

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    job_title: Optional[str] = None
    department_id: Optional[str] = None
    employment_type: Optional[str] = None
    country: Optional[str] = None

class EmployeeOut(EmployeeBase):
    id: str
    employee_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    department_name: Optional[str] = None

    model_config = {"from_attributes": True}

class EmployeeListOut(BaseModel):
    items: list[EmployeeOut]
    total: int
    page: int
    page_size: int
    total_pages: int
