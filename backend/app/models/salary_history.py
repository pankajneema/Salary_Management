import uuid
from datetime import datetime
from sqlalchemy import String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class SalaryHistory(Base):
    __tablename__ = "salary_history"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id: Mapped[str] = mapped_column(String, ForeignKey("employees.id"), nullable=False, index=True)
    old_amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    new_amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    old_currency: Mapped[str] = mapped_column(String(3), nullable=False)
    new_currency: Mapped[str] = mapped_column(String(3), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="salary_history")
