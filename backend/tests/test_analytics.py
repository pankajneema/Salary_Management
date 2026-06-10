def test_analytics_empty_db(client):
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_employees"] == 0
    assert data["total_active"] == 0
    assert data["by_department"] == []
    assert data["top_earners"] == []


def test_analytics_with_data(client, sample_employee):
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_active"] == 1
    assert len(data["by_department"]) == 1
    assert data["by_department"][0]["department"] == "Engineering"
    assert data["by_department"][0]["headcount"] == 1
    assert len(data["top_earners"]) == 1
    assert data["top_earners"][0]["full_name"] == "Test User"


def test_salary_distribution(client, sample_employee):
    res = client.get("/api/analytics/summary")
    data = res.json()
    dist = data["salary_distribution"]
    assert len(dist) == 6
    # 1_000_000 INR falls in 150k+ bucket
    top_bucket = next(b for b in dist if b["bucket"] == "150k+")
    assert top_bucket["count"] == 1
