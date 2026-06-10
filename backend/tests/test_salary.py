def test_update_salary(client, sample_employee):
    payload = {"new_amount": "1200000", "new_currency": "INR", "reason": "Annual hike"}
    res = client.put(f"/api/employees/{sample_employee.id}/salary", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert float(data["new_amount"]) == 1_200_000
    assert data["old_currency"] == "INR"
    assert data["reason"] == "Annual hike"


def test_salary_history(client, sample_employee):
    # do two updates
    client.put(f"/api/employees/{sample_employee.id}/salary",
               json={"new_amount": "1100000", "new_currency": "INR", "reason": "Hike 1"})
    client.put(f"/api/employees/{sample_employee.id}/salary",
               json={"new_amount": "1200000", "new_currency": "INR", "reason": "Hike 2"})

    res = client.get(f"/api/employees/{sample_employee.id}/salary-history")
    assert res.status_code == 200
    history = res.json()
    assert len(history) == 2
    # most recent first
    assert history[0]["reason"] == "Hike 2"


def test_salary_update_not_found(client):
    res = client.put("/api/employees/nonexistent/salary",
                     json={"new_amount": "100000", "new_currency": "INR"})
    assert res.status_code == 404


def test_salary_currency_change(client, sample_employee):
    payload = {"new_amount": "50000", "new_currency": "USD", "reason": "Relocation"}
    res = client.put(f"/api/employees/{sample_employee.id}/salary", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["old_currency"] == "INR"
    assert data["new_currency"] == "USD"
