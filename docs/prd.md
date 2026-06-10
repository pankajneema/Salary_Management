# Product Requirements Document (PRD)
## ACME Corp — Salary Management System
**Version:** 1.0  
**Status:** Draft  
**Author:** HR Engineering Team  
**Primary User:** HR Manager  
**Target Launch:** To Be Determined

---

## 1. Overview & Goal

ACME Corp currently manages salary data for 10,000+ employees across multiple countries using Excel spreadsheets. This manual process is error-prone, time-consuming, and does not scale.

The **Salary Management System (SMS)** aims to replace this workflow with a purpose-built web application that allows the HR Manager to efficiently manage, query, and report on employee compensation data — with zero technical expertise required.

---

## 2. User Persona

### Primary User: HR Manager
- Manages compensation for 10,000+ employees across multiple countries
- Non-technical — needs a clean, intuitive UI
- Needs to quickly find, update, and report on salary data
- Currently spends hours each week updating Excel files manually
- Needs to answer leadership questions like: *"What is our average engineering salary in India?"*

### Out-of-Scope Users (V1)
- **Employees** — no self-service portal in this version
- **Finance team** — payroll processing handled by a separate system
- **System Administrators** — managed outside this application

---

## 3. Problem Statement

Current pain points with the Excel-based process:

- No single source of truth — multiple Excel files, version conflicts
- Manual edits are error-prone — wrong cell edits, accidental deletions
- No search or filter — finding one employee across 10,000 rows is tedious
- No analytics — answering *"What is avg salary by dept?"* requires manual pivot tables
- No audit trail — impossible to know who changed what and when
- Multi-currency chaos — INR, USD, GBP mixed inconsistently across sheets

---

## 4. Scope & Features

### 4.1 Employee Management
- View paginated list of all employees with key salary details
- Search by name, Employee ID, or job title
- Filter by department, country, employment type, or currency
- Add new employee with full salary details
- Edit existing employee — name, title, department, salary, currency
- Delete employee (soft delete with confirmation dialog)

### 4.2 Salary Operations
- Update salary with a reason/note (e.g., annual hike, promotion)
- View salary change history per employee
- Multi-currency support — INR, USD, GBP, EUR, AUD and more
- Employment type tracking — Full-time, Part-time, Contract

### 4.3 Analytics & Reporting
- Average salary by department
- Average salary by country
- Salary distribution histogram
- Top 10 highest paid employees
- Total payroll cost by department
- Headcount by country and department

### 4.4 Data Import & Export
- Bulk CSV import to migrate existing Excel data
- Row-level validation with clear error messages on import
- Export filtered employee data as CSV

### 4.5 Feature Priority Summary

| Feature | Priority | Notes |
|---|---|---|
| Employee Directory + Pagination | P0 | Core view — must work with 10k records |
| Search & Filter | P0 | Name, dept, country, role filters |
| Add / Edit / Delete Employee | P0 | Full CRUD with confirmation dialogs |
| Salary Update + History | P0 | Track every change with timestamp |
| Multi-Currency Support | P0 | ISO 4217 currency codes |
| Analytics Dashboard | P1 | Charts: dept, country, distribution |
| Bulk CSV Import | P1 | Migrate from Excel seamlessly |
| CSV Export | P1 | Download filtered results |
| Salary Change Audit Log | P2 | Full history view per employee |

---

## 5. Employee Data Model

### employees table

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Auto-generated primary key |
| `employee_id` | String | Human-readable ID (e.g., EMP-0001) |
| `full_name` | String | Employee full name |
| `job_title` | String | Current role |
| `department_id` | UUID (FK) | Foreign key → departments |
| `employment_type` | Enum | Full-time, Part-time, Contract |
| `country` | String | Country of employment |
| `salary_amount` | Decimal | Current salary |
| `currency` | String | ISO 4217 code (INR, USD, GBP…) |
| `date_of_joining` | Date | — |
| `is_active` | Boolean | Soft delete flag |
| `created_at` | Timestamp | System-managed |
| `updated_at` | Timestamp | System-managed |

### salary_history table

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Auto-generated primary key |
| `employee_id` | UUID (FK) | Foreign key → employees |
| `old_amount` | Decimal | Salary before change |
| `new_amount` | Decimal | Salary after change |
| `old_currency` | String | Currency before change (ISO 4217) |
| `new_currency` | String | Currency after change (ISO 4217) |
| `reason` | String | e.g., Annual hike, Promotion |
| `changed_at` | Timestamp | System-managed |

### departments table

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Auto-generated primary key |
| `name` | String | e.g., Engineering, HR, Sales |
| `created_at` | Timestamp | System-managed |

> `headcount` and `avg_salary` are computed via query — not stored in the DB to avoid stale data.

---

## 6. What We Are Deliberately Leaving Out

This section documents conscious decisions about what is **not** in scope for V1, and why.

| Excluded | Reason |
|---|---|
| **User Authentication / Login** | Single HR Manager user assumed. Auth adds OAuth/JWT complexity that delays v1. Planned for v2 with role-based access. |
| **Employee Self-Service Portal** | Employees viewing their own data requires RBAC, notifications, and a different UX — a separate product problem. |
| **Payroll Processing** | Generating payslips, tax calculation, bank transfers belongs in a dedicated payroll system (e.g., Razorpay Payroll). We manage data, not disbursements. |
| **Leave & Attendance Management** | An HRMS feature unrelated to salary management — separate system concern entirely. |
| **Performance Reviews / Appraisals** | Linking appraisal scores to salary hikes is a complex workflow. Planned for v2 roadmap. |
| **Real-time Currency Conversion** | Salaries stored in native currency. Live FX conversion is a v2 enhancement. |
| **Mobile App** | Web-first for v1. HR Manager primarily uses desktop. Mobile-responsive web is in scope; native app is not. |
| **Email / Notification System** | No alerts on salary changes in v1. Simple CRUD operations only. |

---

## 7. Tech Stack

### Backend
| Layer | Choice |
|---|---|
| Language | Python |
| Framework | FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Migrations | Alembic |
| Testing | pytest |

### Frontend
| Layer | Choice |
|---|---|
| Framework | Next.js (React) |
| Component Library | ShadCN UI / MUI |
| State Management | React Query |
| Charts | Recharts |
| Testing | React Testing Library |

---

## 8. Development Phases

The project is broken into four logical phases, each delivering a self-contained, working increment.

### Phase 1 — Foundation
- Database schema design (employees, salary history, departments)
- Project scaffolding — FastAPI backend + Next.js frontend
- Seed script to populate 10,000 realistic employee records
- Core API setup with error handling and validation middleware

### Phase 2 — Core CRUD
- Employee list API with pagination, search, and filtering
- Add / Edit / Delete employee endpoints
- Salary update endpoint with history tracking
- Frontend — Employee directory table with search and filter UI
- Frontend — Add / Edit / Delete modals

### Phase 3 — Analytics & Data Tools
- Analytics APIs — avg salary by dept, country, role
- Frontend — Analytics dashboard with charts
- CSV bulk import with row-level validation and error reporting
- CSV export of filtered employee data

### Phase 4 — Quality & Deployment
- Unit tests for all core API endpoints (pytest)
- Frontend component tests (React Testing Library)
- Performance testing with 10,000 records — query optimization
- Deployment setup — fully functional hosted environment
- Final polish — loading states, empty states, error handling in UI

---

## 9. Success Metrics

- HR Manager can find any employee record in under **5 seconds**
- Bulk import of 10,000 records completes in under **30 seconds**
- Zero data loss — all salary edits tracked with timestamps
- Analytics dashboard loads in under **2 seconds**
- Zero critical bugs at launch

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Performance with 10,000 records | Pagination + DB indexing on name, dept, country |
| Multi-currency confusion | Always display ISO currency code alongside every amount |
| Data migration from Excel | Robust CSV import with validation and per-row error reporting |
| Scope creep during build | This PRD as guardrail — reject non-v1 features explicitly |

---

*End of Document — ACME Corp Salary Management System PRD v1.0*
