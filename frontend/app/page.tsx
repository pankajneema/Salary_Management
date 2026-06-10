import Link from "next/link";

import { EmployeeTable } from "@/components/EmployeeTable";
import { StatCard } from "@/components/StatCard";
import { fetchAnalytics, fetchEmployees } from "@/lib/api";

export default async function HomePage() {
  const [employeesResult, analyticsResult] = await Promise.allSettled([
    fetchEmployees(),
    fetchAnalytics(),
  ]);

  const employees = employeesResult.status === "fulfilled" ? employeesResult.value.items : [];
  const analytics = analyticsResult.status === "fulfilled" ? analyticsResult.value : null;

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <span className="eyebrow">ACME Corp HR workspace</span>
          <h1>Manage salary data without the spreadsheet chaos.</h1>
          <p>
            A focused salary directory with CRUD operations, salary history tracking, analytics, and CSV import/export
            support for 10,000+ employees.
          </p>
          <div className="hero-actions">
            <Link href="/" className="button">
              Employee directory
            </Link>
            <Link href="/analytics" className="button-secondary">
              View analytics
            </Link>
          </div>
        </section>

        <section className="section">
          <p className="kicker">Dashboard</p>
          <div className="grid">
            <StatCard
              label="Active employees"
              value={analytics ? analytics.total_active.toLocaleString() : "—"}
              note="Records currently marked as active"
            />
            <StatCard
              label="Departments tracked"
              value={analytics ? String(analytics.by_department.length) : "—"}
              note="Computed from live analytics"
            />
            <StatCard
              label="Countries covered"
              value={analytics ? String(analytics.by_country.length) : "—"}
              note="Each country can use its native currency"
            />
            <StatCard
              label="Top earners shown"
              value={analytics ? String(analytics.top_earners.length) : "—"}
              note="Preview of the current salary leaders"
            />
          </div>
        </section>

        <section className="section columns-2">
          <article className="card stack">
            <div>
              <p className="kicker">Quick read</p>
              <h2>What the UI covers</h2>
            </div>
            <ul className="muted">
              <li>Searchable, paginated employee directory</li>
              <li>Department-aware salary summaries</li>
              <li>Salary history and change tracking</li>
              <li>CSV import/export for migration work</li>
            </ul>
          </article>

          <article className="card stack">
            <div>
              <p className="kicker">Backend status</p>
              <h2>Connected to the FastAPI API</h2>
            </div>
            <p className="muted">
              The page reads from <code>/api/employees</code> and <code>/api/analytics/summary</code>. If the API is
              offline, the shell still renders and the metrics fall back to placeholders.
            </p>
          </article>
        </section>

        <section className="section">
          <p className="kicker">Directory preview</p>
          {employees.length > 0 ? (
            <EmployeeTable employees={employees} />
          ) : (
            <article className="card">
              <h2>No records loaded yet</h2>
              <p className="muted">
                Start the backend, seed the database, and the first eight employees will appear here.
              </p>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
