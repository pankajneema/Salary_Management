from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeOut, EmployeeListOut
from app.services import employee_service

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=EmployeeListOut)
def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    department_id: Optional[str] = None,
    country: Optional[str] = None,
    employment_type: Optional[str] = None,
    currency: Optional[str] = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db_session),
):
    return employee_service.get_employees(
        db, page, page_size, search, department_id, country, employment_type, currency, sort_by, sort_order
    )


@router.post("", response_model=EmployeeOut, status_code=201)
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db_session),
    idempotency_key: Optional[str] = Header(default=None, alias="Idempotency-Key"),
):
    return employee_service.create_employee(db, data, idempotency_key=idempotency_key)


@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: str, db: Session = Depends(get_db_session)):
    emp = employee_service.get_employee(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee_service._serialize_employee(emp)


@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: str, data: EmployeeUpdate, db: Session = Depends(get_db_session)):
    emp = employee_service.update_employee(db, employee_id, data)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@router.delete("/{employee_id}", status_code=204)
def delete_employee(employee_id: str, db: Session = Depends(get_db_session)):
    deleted = employee_service.delete_employee(db, employee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")
