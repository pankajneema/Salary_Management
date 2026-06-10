import uuid
from datetime import datetime
from typing import Optional
from fastapi.encoders import jsonable_encoder
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models.employee import Employee
from app.models.department import Department
from app.models.idempotency_key import IdempotencyKey
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
    page_size: int = 10,
    search: Optional[str] = None,
    department_id: Optional[str] = None,
    country: Optional[str] = None,
    employment_type: Optional[str] = None,
    currency: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
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

    sort_columns = {
        "employee_id": Employee.employee_id,
        "full_name": Employee.full_name,
        "job_title": Employee.job_title,
        "country": Employee.country,
        "salary_amount": Employee.salary_amount,
        "created_at": Employee.created_at,
        "updated_at": Employee.updated_at,
        "department_name": Department.name,
    }
    sort_column = sort_columns.get(sort_by, Employee.created_at)
    sort_direction = sort_order.lower()
    if sort_column is Department.name:
        query = query.join(Department)
    if sort_direction == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

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


def create_employee(db: Session, data: EmployeeCreate, idempotency_key: Optional[str] = None) -> dict:
    if idempotency_key:
        existing_entry = (
            db.query(IdempotencyKey)
            .filter(
                IdempotencyKey.idempotency_key == idempotency_key,
                IdempotencyKey.operation == "create_employee",
            )
            .first()
        )
        if existing_entry:
            return existing_entry.response_payload

    emp = Employee(
        id=str(uuid.uuid4()),
        employee_id=_next_employee_id(db),
        **data.model_dump(),
    )
    db.add(emp)
    db.flush()
    serialized = _serialize_employee(emp)
    serialized_payload = jsonable_encoder(serialized)
    if idempotency_key:
        db.add(
            IdempotencyKey(
                idempotency_key=idempotency_key,
                operation="create_employee",
                response_payload=serialized_payload,
            )
        )
    db.commit()
    db.refresh(emp)
    return serialized_payload


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
