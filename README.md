# ACME Salary Management System

A focused salary management workspace for ACME Corp's HR team. The backend is FastAPI-based, the frontend is a small Next.js app shell, and the repo includes the assessment artifacts the reviewers asked for.

---

## What It Covers

- Employee directory with pagination, search, and filters
- Full employee CRUD with soft delete
- Salary updates with change history
- Analytics summary for departments, countries, top earners, and salary distribution
- CSV import/export for migration work
- Seed script for 10,000 realistic employee records

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python + FastAPI |
| Database | SQLite for local startup, PostgreSQL-compatible codebase |
| ORM | SQLAlchemy + Alembic |
| Frontend | Next.js (React) |
| Testing | pytest |

---

## Repository Layout

```
acme-salary-management/
├── backend/      # API, models, services, tests, seed script
├── frontend/     # Next.js app shell and API-backed views
├── docs/         # PRD, architecture, and artifacts
└── Readme.md
```

---

## Run It

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```

The backend `.env` is already set up for local SQLite usage. If you want PostgreSQL instead, update `backend/.env` with your database URL before starting the app.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend `.env` already points at `http://localhost:8000`.

---

## Artifacts

- [`docs/prd.md`](docs/prd.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/ARTIFACTS.md`](docs/ARTIFACTS.md)

---

## Assessment Notes

- The repo still has limited commit history; that is a process gap, not a code gap.
- The frontend is intentionally lean, but it is wired to the backend and shows the main user flows.
