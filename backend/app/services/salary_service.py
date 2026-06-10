import uuid
from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.salary_history import SalaryHistory
from app.schemas.salary import SalaryUpdate


def update_salary(db: Session, employee_id: str, data: SalaryUpdate):
    emp = db.query(Employee).filter(Employee.id == employee_id, Employee.is_active == True).first()
    if not emp:
        return None

    history = SalaryHistory(
        id=str(uuid.uuid4()),
        employee_id=emp.id,
        old_amount=emp.salary_amount,
        new_amount=data.new_amount,
        old_currency=emp.currency,
        new_currency=data.new_currency,
        reason=data.reason,
    )
    db.add(history)

    emp.salary_amount = data.new_amount
    emp.currency = data.new_currency
    db.commit()
    db.refresh(history)
    return history


def get_salary_history(db: Session, employee_id: str) -> list[SalaryHistory]:
    return (
        db.query(SalaryHistory)
        .filter(SalaryHistory.employee_id == employee_id)
        .order_by(SalaryHistory.changed_at.desc())
        .all()
    )
