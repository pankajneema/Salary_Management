import Link from "next/link";

import { StatCard } from "@/components/StatCard";
import { fetchAnalytics } from "@/lib/api";

export default async function AnalyticsPage() {
  const analyticsResult = await fetchAnalytics().catch(() => null);

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <span className="eyebrow">Analytics dashboard</span>
          <h1>Salary signals at a glance.</h1>
          <p>
            Department averages, country breakdowns, top earners, payroll totals, and salary distribution buckets in a
            single view.
          </p>
          <div className="hero-actions">
            <Link href="/" className="button-secondary">
              Back to directory
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="grid">
            <StatCard
              label="Total employees"
              value={analyticsResult ? analyticsResult.total_employees.toLocaleString() : "—"}
              note="All employee records in the system"
            />
            <StatCard
              label="Active employees"
              value={analyticsResult ? analyticsResult.total_active.toLocaleString() : "—"}
              note="Soft-deleted records excluded"
            />
            <StatCard
              label="Department groups"
              value={analyticsResult ? String(analyticsResult.by_department.length) : "—"}
              note="Grouped by department and currency"
            />
            <StatCard
              label="Salary buckets"
              value={analyticsResult ? String(analyticsResult.salary_distribution.length) : "—"}
              note="Histogram-style distribution"
            />
          </div>
        </section>

        <section className="section columns-2">
          <article className="card stack">
            <div>
              <p className="kicker">Department totals</p>
              <h2>Pay across teams</h2>
            </div>
            {analyticsResult ? (
              <ul className="muted">
                {analyticsResult.by_department.map((department) => (
                  <li key={`${department.department}-${department.currency}`}>
                    {department.department}: {department.currency} {department.total_payroll.toLocaleString()} across{" "}
                    {department.headcount} people
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Connect the API to view live department payroll totals.</p>
            )}
          </article>

          <article className="card stack">
            <div>
              <p className="kicker">Country view</p>
              <h2>Regional salary picture</h2>
            </div>
            {analyticsResult ? (
              <ul className="muted">
                {analyticsResult.by_country.map((country) => (
                  <li key={country.country}>
                    {country.country}: average {country.avg_salary.toLocaleString()} across {country.headcount} people
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Country averages appear here once the FastAPI backend is available.</p>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
