from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.salary import SalaryUpdate, SalaryHistoryOut
from app.services import salary_service

router = APIRouter(prefix="/employees", tags=["salary"])


@router.put("/{employee_id}/salary", response_model=SalaryHistoryOut)
def update_salary(employee_id: str, data: SalaryUpdate, db: Session = Depends(get_db_session)):
    result = salary_service.update_salary(db, employee_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Employee not found")
    return result


@router.get("/{employee_id}/salary-history", response_model=list[SalaryHistoryOut])
def get_salary_history(employee_id: str, db: Session = Depends(get_db_session)):
    return salary_service.get_salary_history(db, employee_id)
