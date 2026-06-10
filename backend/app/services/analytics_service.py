from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.department import Department


def get_analytics_summary(db: Session) -> dict:
    total_employees = db.query(func.count(Employee.id)).scalar()
    total_active = db.query(func.count(Employee.id)).filter(Employee.is_active == True).scalar()

    # avg salary + headcount + total payroll by department (INR only for uniformity)
    dept_rows = (
        db.query(
            Department.name,
            func.avg(Employee.salary_amount).label("avg_salary"),
            func.count(Employee.id).label("headcount"),
            func.sum(Employee.salary_amount).label("total_payroll"),
            Employee.currency,
        )
        .join(Employee, Employee.department_id == Department.id)
        .filter(Employee.is_active == True)
        .group_by(Department.name, Employee.currency)
        .order_by(func.count(Employee.id).desc())
        .all()
    )
    by_department = [
        {
            "department": r.name,
            "avg_salary": round(float(r.avg_salary), 2),
            "headcount": r.headcount,
            "total_payroll": round(float(r.total_payroll), 2),
            "currency": r.currency,
        }
        for r in dept_rows
    ]

    # avg salary + headcount by country
    country_rows = (
        db.query(
            Employee.country,
            func.avg(Employee.salary_amount).label("avg_salary"),
            func.count(Employee.id).label("headcount"),
        )
        .filter(Employee.is_active == True)
        .group_by(Employee.country)
        .order_by(func.count(Employee.id).desc())
        .all()
    )
    by_country = [
        {
            "country": r.country,
            "avg_salary": round(float(r.avg_salary), 2),
            "headcount": r.headcount,
        }
        for r in country_rows
    ]

    # top 10 earners
    top_rows = (
        db.query(Employee, Department.name.label("dept_name"))
        .join(Department, Employee.department_id == Department.id)
        .filter(Employee.is_active == True)
        .order_by(Employee.salary_amount.desc())
        .limit(10)
        .all()
    )
    top_earners = [
        {
            "employee_id": emp.employee_id,
            "full_name": emp.full_name,
            "job_title": emp.job_title,
            "department": dept_name,
            "salary_amount": float(emp.salary_amount),
            "currency": emp.currency,
        }
        for emp, dept_name in top_rows
    ]

    # salary distribution buckets
    buckets = _salary_distribution(db)

    return {
        "total_employees": total_employees,
        "total_active": total_active,
        "by_department": by_department,
        "by_country": by_country,
        "top_earners": top_earners,
        "salary_distribution": buckets,
    }


def _salary_distribution(db: Session) -> list[dict]:
    ranges = [
        ("0-25k", 0, 25000),
        ("25k-50k", 25000, 50000),
        ("50k-75k", 50000, 75000),
        ("75k-100k", 75000, 100000),
        ("100k-150k", 100000, 150000),
        ("150k+", 150000, None),
    ]
    result = []
    for label, low, high in ranges:
        q = db.query(func.count(Employee.id)).filter(
            Employee.is_active == True,
            Employee.salary_amount >= low,
        )
        if high is not None:
            q = q.filter(Employee.salary_amount < high)
        result.append({"bucket": label, "count": q.scalar()})
    return result
