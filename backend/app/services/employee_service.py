import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models.employee import Employee
from app.models.department import Department
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


def _next_employee_id(db: Session) -> str:
    count = db.query(func.count(Employee.id)).scalar() or 0
    return f"EMP-{count + 1:05d}"


def _serialize_employee(emp: Employee) -> dict:
    payload = {column.name: getattr(emp, column.name) for column in emp.__table__.columns}
    payload["department_name"] = emp.dept.name if emp.dept else None
    return payload


def get_employees(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    department_id: Optional[str] = None,
    country: Optional[str] = None,
    employment_type: Optional[str] = None,
    currency: Optional[str] = None,
) -> dict:
    query = (
        db.query(Employee)
        .options(joinedload(Employee.dept))
        .filter(Employee.is_active == True)
    )

    if search:
        query = query.filter(
            or_(
                Employee.full_name.ilike(f"%{search}%"),
                Employee.employee_id.ilike(f"%{search}%"),
                Employee.job_title.ilike(f"%{search}%"),
            )
        )
    if department_id:
        query = query.filter(Employee.department_id == department_id)
    if country:
        query = query.filter(Employee.country == country)
    if employment_type:
        query = query.filter(Employee.employment_type == employment_type)
    if currency:
        query = query.filter(Employee.currency == currency.upper())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [_serialize_employee(emp) for emp in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, -(-total // page_size)),
    }


def get_employee(db: Session, employee_id: str) -> Optional[Employee]:
    return (
        db.query(Employee)
        .options(joinedload(Employee.dept))
        .filter(Employee.id == employee_id, Employee.is_active == True)
        .first()
    )


def create_employee(db: Session, data: EmployeeCreate) -> dict:
    emp = Employee(
        id=str(uuid.uuid4()),
        employee_id=_next_employee_id(db),
        **data.model_dump(),
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return _serialize_employee(emp)


def update_employee(db: Session, employee_id: str, data: EmployeeUpdate) -> Optional[dict]:
    emp = get_employee(db, employee_id)
    if not emp:
        return None
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(emp, field, value)
    emp.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(emp)
    return _serialize_employee(emp)


def delete_employee(db: Session, employee_id: str) -> bool:
    emp = get_employee(db, employee_id)
    if not emp:
        return False
    emp.is_active = False
    emp.updated_at = datetime.utcnow()
    db.commit()
    return True
