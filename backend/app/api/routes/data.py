import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.api.deps import get_db_session
from app.models.employee import Employee
from app.models.department import Department
from app.services import import_service

router = APIRouter(tags=["data"])


@router.post("/import/csv")
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db_session)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")
    content = await file.read()
    return import_service.process_csv_import(db, content)


@router.get("/export/csv")
def export_csv(
    department_id: Optional[str] = None,
    country: Optional[str] = None,
    employment_type: Optional[str] = None,
    db: Session = Depends(get_db_session),
):
    query = (
        db.query(Employee)
        .options(joinedload(Employee.dept))
        .filter(Employee.is_active == True)
    )
    if department_id:
        query = query.filter(Employee.department_id == department_id)
    if country:
        query = query.filter(Employee.country == country)
    if employment_type:
        query = query.filter(Employee.employment_type == employment_type)

    employees = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["employee_id", "full_name", "job_title", "department", "employment_type", "country", "salary_amount", "currency", "date_of_joining"])
    for emp in employees:
        writer.writerow([
            emp.employee_id, emp.full_name, emp.job_title,
            emp.dept.name if emp.dept else "",
            emp.employment_type, emp.country,
            emp.salary_amount, emp.currency, emp.date_of_joining,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employees.csv"},
    )
