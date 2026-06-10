from pydantic import BaseModel

class DeptSalary(BaseModel):
    department: str
    avg_salary: float
    headcount: int
    total_payroll: float
    currency: str

class CountrySalary(BaseModel):
    country: str
    avg_salary: float
    headcount: int

class TopEmployee(BaseModel):
    employee_id: str
    full_name: str
    job_title: str
    department: str
    salary_amount: float
    currency: str

class SalaryBucket(BaseModel):
    bucket: str
    count: int

class AnalyticsSummary(BaseModel):
    total_employees: int
    total_active: int
    by_department: list[DeptSalary]
    by_country: list[CountrySalary]
    top_earners: list[TopEmployee]
    salary_distribution: list[SalaryBucket]
