def test_list_employees_empty(client):
    res = client.get("/api/employees")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 0
    assert data["items"] == []


def test_create_employee(client, sample_dept):
    payload = {
        "full_name": "Jane Doe",
        "job_title": "Engineer",
        "department_id": sample_dept.id,
        "employment_type": "full-time",
        "country": "India",
        "salary_amount": "900000",
        "currency": "INR",
        "date_of_joining": "2023-01-15",
    }
    res = client.post("/api/employees", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["full_name"] == "Jane Doe"
    assert data["currency"] == "INR"
    assert data["employee_id"].startswith("EMP-")


def test_create_employee_invalid_salary(client, sample_dept):
    payload = {
        "full_name": "Bad Salary",
        "job_title": "Engineer",
        "department_id": sample_dept.id,
        "employment_type": "full-time",
        "country": "India",
        "salary_amount": "-100",
        "currency": "INR",
        "date_of_joining": "2023-01-15",
    }
    res = client.post("/api/employees", json=payload)
    assert res.status_code == 422


def test_get_employee(client, sample_employee):
    res = client.get(f"/api/employees/{sample_employee.id}")
    assert res.status_code == 200
    assert res.json()["full_name"] == "Test User"


def test_get_employee_not_found(client):
    res = client.get("/api/employees/nonexistent-id")
    assert res.status_code == 404


def test_update_employee(client, sample_employee):
    res = client.put(f"/api/employees/{sample_employee.id}", json={"job_title": "Senior Engineer"})
    assert res.status_code == 200
    assert res.json()["job_title"] == "Senior Engineer"


def test_delete_employee(client, sample_employee):
    res = client.delete(f"/api/employees/{sample_employee.id}")
    assert res.status_code == 204
    # confirm soft deleted
    res2 = client.get(f"/api/employees/{sample_employee.id}")
    assert res2.status_code == 404


def test_search_employees(client, sample_employee):
    res = client.get("/api/employees?search=Test")
    assert res.status_code == 200
    assert res.json()["total"] == 1


def test_filter_by_country(client, sample_employee):
    res = client.get("/api/employees?country=India")
    assert res.status_code == 200
    assert res.json()["total"] == 1

    res2 = client.get("/api/employees?country=USA")
    assert res2.json()["total"] == 0


def test_pagination(client, sample_dept):
    # create 5 employees
    for i in range(5):
        client.post("/api/employees", json={
            "full_name": f"Employee {i}",
            "job_title": "Engineer",
            "department_id": sample_dept.id,
            "employment_type": "full-time",
            "country": "India",
            "salary_amount": "800000",
            "currency": "INR",
            "date_of_joining": "2023-01-01",
        })
    res = client.get("/api/employees?page=1&page_size=2")
    data = res.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["total_pages"] == 3
