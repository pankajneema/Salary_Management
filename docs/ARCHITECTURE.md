# System Architecture
## ACME Salary Management System

---

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (HR Manager)                     │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌────────┐  │
│   │  Employee   │  │  Add / Edit │  │Analytics │  │  CSV   │  │
│   │  Directory  │  │   Modals    │  │Dashboard │  │Import/ │  │
│   │  + Search   │  │             │  │+ Charts  │  │Export  │  │
│   └─────────────┘  └─────────────┘  └──────────┘  └────────┘  │
│                                                                 │
│              Next.js  ·  ShadCN UI  ·  Recharts                │
│              React Query (API caching + state)                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │  HTTP / REST
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI — API Gateway                      │
│         Pydantic validation · CORS · Error handling             │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  /employees  │   /salary    │  /analytics  │  /import · /export │
└──────┬───────┴──────┬───────┴──────┬───────┴─────────┬──────────┘
       │              │              │                 │
       ▼              ▼              ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                              │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ EmployeeService │  │  SalaryService  │  │AnalyticsService│  │
│  │                 │  │                 │  │                │  │
│  │ · CRUD ops      │  │ · Update salary │  │ · Avg by dept  │  │
│  │ · Pagination    │  │ · Change history│  │ · Avg by country│ │
│  │ · Search/filter │  │ · Multi-currency│  │ · Payroll total│  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              SQLAlchemy ORM  +  Alembic Migrations              │
│         Models · Sessions · Query building · Schema versions    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                        │
│                                                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   employees     │  │  salary_history  │  │  departments  │  │
│  │                 │  │                  │  │               │  │
│  │ · id (PK)       │  │ · id (PK)        │  │ · id (PK)     │  │
│  │ · employee_id   │  │ · employee_id(FK)│  │ · name        │  │
│  │ · full_name     │  │ · old_amount     │  │ · created_at  │  │
│  │ · job_title     │  │ · new_amount     │  │               │  │
│  │ · department(FK)│  │ · old_currency   │  │ (headcount &  │  │
│  │ · country       │  │ · new_currency   │  │  avg_salary   │  │
│  │ · salary_amount │  │ · changed_at     │  │  computed via │  │
│  │ · currency      │  │ · reason         │  │  query, not   │  │
│  │ · is_active     │  │                  │  │  stored)      │  │
│  │ · created_at    │  │                  │  │               │  │
│  │ · updated_at    │  │                  │  │               │  │
│  └─────────────────┘  └──────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Folder Structure

```
acme-salary-management/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── employees.py       # GET, POST, PUT, DELETE /employees
│   │   │   │   ├── salary.py          # PUT /employees/{id}/salary
│   │   │   │   ├── analytics.py       # GET /analytics/summary
│   │   │   │   └── data.py            # POST /import, GET /export
│   │   │   └── deps.py                # Shared dependencies (DB session)
│   │   ├── models/
│   │   │   ├── employee.py            # SQLAlchemy Employee model
│   │   │   ├── salary_history.py      # SQLAlchemy SalaryHistory model
│   │   │   └── department.py          # SQLAlchemy Department model
│   │   ├── schemas/
│   │   │   ├── employee.py            # Pydantic request/response schemas
│   │   │   ├── salary.py              # Pydantic salary schemas
│   │   │   └── analytics.py           # Pydantic analytics schemas
│   │   ├── services/
│   │   │   ├── employee_service.py    # Business logic — CRUD, search, filter
│   │   │   ├── salary_service.py      # Business logic — updates, history
│   │   │   ├── analytics_service.py   # Business logic — aggregations
│   │   │   └── import_service.py      # Business logic — CSV parse, validate, bulk insert
│   │   ├── core/
│   │   │   ├── config.py              # App settings (DB URL, env vars)
│   │   │   └── database.py            # SQLAlchemy engine + session setup
│   │   └── main.py                    # FastAPI app entry point
│   ├── alembic/                       # DB migration files
│   ├── tests/
│   │   ├── test_employees.py
│   │   ├── test_salary.py
│   │   └── test_analytics.py
│   ├── seed.py                        # Seeds 10,000 employees
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                   # Employee directory (home)
│   │   ├── analytics/
│   │   │   └── page.tsx               # Analytics dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   ├── employees/
│   │   │   ├── EmployeeTable.tsx      # Paginated table with search/filter
│   │   │   ├── EmployeeModal.tsx      # Add / Edit modal
│   │   │   └── SalaryHistory.tsx      # Per-employee history drawer
│   │   ├── analytics/
│   │   │   ├── SalaryByDept.tsx       # Bar chart
│   │   │   ├── SalaryByCountry.tsx    # Bar/map chart
│   │   │   └── SalaryDistribution.tsx # Histogram
│   │   └── ui/                        # ShadCN base components
│   ├── lib/
│   │   ├── api.ts                     # Axios/fetch API client
│   │   └── utils.ts                   # Helpers (currency format etc.)
│   ├── package.json
│   └── .env.example
│
├── docs/
│   ├── PRD.md                         # Product Requirements Document
│   └── ARCHITECTURE.md                # This file
│
└── README.md
```

---

## API Endpoints

```
EMPLOYEES
  GET    /api/employees              List (paginated, searchable, filterable)
  POST   /api/employees              Create new employee
  GET    /api/employees/{id}         Get single employee
  PUT    /api/employees/{id}         Update employee details
  DELETE /api/employees/{id}         Soft delete

SALARY
  PUT    /api/employees/{id}/salary         Update salary (logged to history)
  GET    /api/employees/{id}/salary-history Full change log

ANALYTICS
  GET    /api/analytics/summary             Dashboard metrics

DATA
  POST   /api/import/csv                    Bulk import from CSV
  GET    /api/export/csv                    Export filtered data
```

---

## Data Flow — Salary Update

```
HR Manager
    │
    │  clicks "Update Salary"
    ▼
EmployeeModal (frontend)
    │
    │  PUT /api/employees/{id}/salary
    │  { new_amount, currency, reason }
    ▼
FastAPI Router  →  Pydantic validates request
    │
    ▼
SalaryService
    ├── reads current salary from employees table
    ├── writes row to salary_history (old + new amount, reason, timestamp)
    └── updates salary_amount in employees table
    │
    ▼
SQLAlchemy  →  PostgreSQL
    │
    ▼
200 OK  →  React Query invalidates cache  →  UI refreshes
```

---

## Data Flow — CSV Import

```
HR Manager uploads CSV file
    │
    ▼
Frontend  →  POST /api/import/csv  (multipart/form-data)
    │
    ▼
FastAPI  →  reads file stream
    │
    ▼
ImportService
    ├── parses CSV row by row
    ├── validates each row (required fields, currency code, salary > 0)
    ├── collects errors per row (does not abort on first error)
    └── bulk inserts valid rows via SQLAlchemy
    │
    ▼
Response: { imported: 9980, errors: 20, error_details: [...] }
    │
    ▼
Frontend shows import summary to HR Manager
```
