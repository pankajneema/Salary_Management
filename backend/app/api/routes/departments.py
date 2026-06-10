from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.models.department import Department
from app.schemas.department import DepartmentOut

router = APIRouter(prefix="/departments", tags=["departments"])

@router.get("", response_model=list[DepartmentOut])
def list_departments(db: Session = Depends(get_db_session)):
    return db.query(Department).order_by(Department.name).all()
