import uuid
from datetime import date, datetime
from sqlalchemy import String, Boolean, Numeric, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    job_title: Mapped[str] = mapped_column(String(150), nullable=False)
    department_id: Mapped[str] = mapped_column(String, ForeignKey("departments.id"), nullable=False, index=True)
    employment_type: Mapped[str] = mapped_column(String(20), nullable=False)  # full-time, part-time, contract
    country: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    salary_amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    date_of_joining: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    dept: Mapped["Department"] = relationship("Department", back_populates="employees")
    salary_history: Mapped[list["SalaryHistory"]] = relationship("SalaryHistory", back_populates="employee", order_by="SalaryHistory.changed_at.desc()")

    __table_args__ = (
        Index("ix_employees_name_dept", "full_name", "department_id"),
    )
