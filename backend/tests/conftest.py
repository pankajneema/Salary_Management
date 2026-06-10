import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_dept(db):
    from app.models.department import Department
    import uuid
    dept = Department(id=str(uuid.uuid4()), name="Engineering")
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@pytest.fixture
def sample_employee(db, sample_dept):
    from app.models.employee import Employee
    import uuid
    from datetime import date
    emp = Employee(
        id=str(uuid.uuid4()),
        employee_id="EMP-00001",
        full_name="Test User",
        job_title="Software Engineer",
        department_id=sample_dept.id,
        employment_type="full-time",
        country="India",
        salary_amount=1_000_000,
        currency="INR",
        date_of_joining=date(2022, 1, 1),
        is_active=True,
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp
