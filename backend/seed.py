"""
Seed script — generates 10,000 realistic employees across multiple countries.
Usage:
    python seed.py
    python seed.py --count 500   # for quick dev testing
"""
import argparse
import random
import sys
import uuid
from datetime import date, timedelta
from decimal import Decimal

from faker import Faker
from sqlalchemy.orm import Session

from app.core.database import engine, Base
from app.models.department import Department
from app.models.employee import Employee

fake = Faker()
Faker.seed(42)
random.seed(42)

# ── CONFIGURATION ──────────────────────────────────────────────────────────────

DEPARTMENTS = [
    "Engineering",
    "HR",
    "Sales",
    "Marketing",
    "Finance",
    "Operations",
]

# country → (currency, salary_min, salary_max, locale)
COUNTRY_CONFIG = {
    "India":         ("INR", 400_000,  2_500_000, "en_IN"),
    "United States": ("USD",  60_000,    250_000, "en_US"),
    "United Kingdom":("GBP",  35_000,    180_000, "en_GB"),
    "Germany":       ("EUR",  45_000,    160_000, "de_DE"),
    "Australia":     ("AUD",  60_000,    200_000, "en_AU"),
}

COUNTRY_WEIGHTS = [0.40, 0.25, 0.15, 0.10, 0.10]   # sums to 1

EMPLOYMENT_TYPES = ["full-time", "part-time", "contract"]
EMPLOYMENT_WEIGHTS = [0.75, 0.10, 0.15]

# job titles per department
TITLES = {
    "Engineering": [
        "Software Engineer", "Senior Software Engineer", "Staff Engineer",
        "Principal Engineer", "Engineering Manager", "Frontend Developer",
        "Backend Developer", "DevOps Engineer", "Data Engineer", "QA Engineer",
    ],
    "HR": [
        "HR Manager", "HR Business Partner", "Recruiter", "Senior Recruiter",
        "Compensation Analyst", "L&D Specialist", "HR Coordinator",
    ],
    "Sales": [
        "Sales Executive", "Senior Sales Executive", "Account Manager",
        "Sales Manager", "Business Development Manager", "SDR", "AE",
    ],
    "Marketing": [
        "Marketing Manager", "Content Strategist", "SEO Specialist",
        "Growth Marketer", "Product Marketing Manager", "Brand Manager",
    ],
    "Finance": [
        "Financial Analyst", "Senior Financial Analyst", "Finance Manager",
        "Controller", "Accountant", "FP&A Analyst", "Treasury Analyst",
    ],
    "Operations": [
        "Operations Manager", "Operations Analyst", "Project Manager",
        "Program Manager", "Supply Chain Analyst", "Logistics Coordinator",
    ],
}

# ── HELPERS ────────────────────────────────────────────────────────────────────

def random_join_date() -> date:
    start = date(2015, 1, 1)
    end = date(2024, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))


def make_employee(emp_num: int, dept: Department, country: str, currency: str,
                  sal_min: int, sal_max: int, locale: str) -> Employee:
    fake_local = Faker(locale)
    salary = Decimal(str(round(random.uniform(sal_min, sal_max), -2)))
    emp_type = random.choices(EMPLOYMENT_TYPES, weights=EMPLOYMENT_WEIGHTS)[0]
    title = random.choice(TITLES[dept.name])

    return Employee(
        id=str(uuid.uuid4()),
        employee_id=f"EMP-{emp_num:05d}",
        full_name=fake_local.name(),
        job_title=title,
        department_id=dept.id,
        employment_type=emp_type,
        country=country,
        salary_amount=salary,
        currency=currency,
        date_of_joining=random_join_date(),
        is_active=True,
    )


# ── MAIN ───────────────────────────────────────────────────────────────────────

def seed(count: int = 10_000) -> None:
    print(f"Creating tables…")
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        # departments
        existing_depts = {d.name: d for d in db.query(Department).all()}
        depts = {}
        for name in DEPARTMENTS:
            if name in existing_depts:
                depts[name] = existing_depts[name]
            else:
                dept = Department(id=str(uuid.uuid4()), name=name)
                db.add(dept)
                depts[name] = dept
        db.flush()
        print(f"  ✓ {len(DEPARTMENTS)} departments ready")

        # check existing employees
        existing_count = db.query(Employee).count()
        if existing_count >= count:
            print(f"  ✓ Already have {existing_count} employees — skipping seed")
            db.commit()
            return

        start_num = existing_count + 1
        to_create = count - existing_count
        print(f"  Seeding {to_create} employees (EMP-{start_num:05d} → EMP-{count:05d})…")

        countries = list(COUNTRY_CONFIG.keys())
        batch = []
        BATCH_SIZE = 500

        for i, emp_num in enumerate(range(start_num, count + 1), 1):
            country = random.choices(countries, weights=COUNTRY_WEIGHTS)[0]
            currency, sal_min, sal_max, locale = COUNTRY_CONFIG[country]
            dept = depts[random.choice(DEPARTMENTS)]
            emp = make_employee(emp_num, dept, country, currency, sal_min, sal_max, locale)
            batch.append(emp)

            if len(batch) >= BATCH_SIZE:
                db.bulk_save_objects(batch)
                db.flush()
                batch = []
                print(f"    … {i}/{to_create} inserted", end="\r", flush=True)

        if batch:
            db.bulk_save_objects(batch)

        db.commit()
        print(f"\n  ✓ Seeded {to_create} employees successfully")
        print(f"  ✓ Total employees in DB: {db.query(Employee).count()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the ACME salary database")
    parser.add_argument("--count", type=int, default=10_000, help="Number of employees to seed")
    args = parser.parse_args()
    seed(args.count)
