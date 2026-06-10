import csv
import io
import uuid
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.department import Department
from app.models.employee import Employee
from app.models.import_job import ImportJob


REQUIRED_FIELDS = {"full_name", "job_title", "department", "employment_type", "country", "salary_amount", "currency", "date_of_joining"}
VALID_EMPLOYMENT_TYPES = {"full-time", "part-time", "contract"}


def _get_or_create_dept(db: Session, name: str, cache: dict) -> str:
    if name in cache:
        return cache[name]
    dept = db.query(Department).filter(Department.name == name).first()
    if not dept:
        dept = Department(id=str(uuid.uuid4()), name=name)
        db.add(dept)
        db.flush()
    cache[name] = dept.id
    return dept.id


def process_csv_import(db: Session, file_bytes: bytes) -> dict:
    content = file_bytes.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(content))
    errors = []
    employees = []
    dept_cache = {}
    existing_ids = set(r[0] for r in db.query(Employee.employee_id).all())
    counter = db.query(Employee).count()

    for i, row in enumerate(reader, start=2):
        row_errors = _validate_row(row, i)
        if row_errors:
            errors.append({"row": i, "errors": row_errors})
            continue
        try:
            counter += 1
            dept_id = _get_or_create_dept(db, row["department"].strip(), dept_cache)
            emp_id = f"EMP-{counter:05d}"
            while emp_id in existing_ids:
                counter += 1
                emp_id = f"EMP-{counter:05d}"
            existing_ids.add(emp_id)

            emp = Employee(
                id=str(uuid.uuid4()),
                employee_id=emp_id,
                full_name=row["full_name"].strip(),
                job_title=row["job_title"].strip(),
                department_id=dept_id,
                employment_type=row["employment_type"].strip().lower(),
                country=row["country"].strip(),
                salary_amount=Decimal(row["salary_amount"].strip()),
                currency=row["currency"].strip().upper(),
                date_of_joining=datetime.strptime(row["date_of_joining"].strip(), "%Y-%m-%d").date(),
            )
            employees.append(emp)
        except Exception as e:
            errors.append({"row": i, "errors": [str(e)]})

    if employees:
        db.bulk_save_objects(employees)
        db.commit()

    return {"imported": len(employees), "errors": len(errors), "error_details": errors[:50]}


def process_csv_import_job(job_id: str, file_bytes: bytes) -> None:
    db = SessionLocal()
    job: ImportJob | None = None
    try:
        job = db.get(ImportJob, job_id)
        if not job:
            return

        job.status = "running"
        job.started_at = datetime.utcnow()
        db.commit()

        result = process_csv_import(db, file_bytes)
        job.status = "completed"
        job.imported_count = result["imported"]
        job.error_count = result["errors"]
        job.error_details = result["error_details"]
        job.completed_at = datetime.utcnow()
        job.error_message = None
        db.commit()
    except Exception as exc:
        if job:
            job.status = "failed"
            job.error_message = str(exc)
            job.completed_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()


def serialize_import_job(job: ImportJob) -> dict[str, Any]:
    return {
        "id": job.id,
        "filename": job.filename,
        "status": job.status,
        "imported_count": job.imported_count,
        "error_count": job.error_count,
        "error_details": job.error_details,
        "error_message": job.error_message,
        "created_at": job.created_at,
        "started_at": job.started_at,
        "completed_at": job.completed_at,
    }


def _validate_row(row: dict, row_num: int) -> list[str]:
    errs = []
    missing = REQUIRED_FIELDS - set(k.strip() for k in row.keys())
    if missing:
        errs.append(f"Missing columns: {missing}")
        return errs

    if not row.get("full_name", "").strip():
        errs.append("full_name is required")
    if not row.get("job_title", "").strip():
        errs.append("job_title is required")
    if not row.get("department", "").strip():
        errs.append("department is required")
    if row.get("employment_type", "").strip().lower() not in VALID_EMPLOYMENT_TYPES:
        errs.append(f"employment_type must be one of {VALID_EMPLOYMENT_TYPES}")
    try:
        val = Decimal(row.get("salary_amount", "0").strip())
        if val <= 0:
            errs.append("salary_amount must be > 0")
    except InvalidOperation:
        errs.append("salary_amount must be a number")
    if len(row.get("currency", "").strip()) != 3:
        errs.append("currency must be a 3-letter ISO code (e.g. INR, USD)")
    try:
        datetime.strptime(row.get("date_of_joining", "").strip(), "%Y-%m-%d")
    except ValueError:
        errs.append("date_of_joining must be YYYY-MM-DD")
    return errs
