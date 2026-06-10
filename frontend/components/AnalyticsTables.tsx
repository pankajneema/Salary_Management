"use client";

import { useMemo, useState } from "react";

import type { AnalyticsSummary } from "@/lib/api";

type AnalyticsTablesProps = {
  analytics: AnalyticsSummary;
};

const PAGE_SIZE = 10;

export function AnalyticsTables({ analytics }: AnalyticsTablesProps) {
  const departmentRows = useMemo(
    () => [...analytics.by_department].sort((left, right) => right.total_payroll - left.total_payroll),
    [analytics.by_department],
  );
  const countryRows = useMemo(
    () => [...analytics.by_country].sort((left, right) => right.avg_salary - left.avg_salary),
    [analytics.by_country],
  );
  const topEarners = useMemo(
    () => [...analytics.top_earners].sort((left, right) => right.salary_amount - left.salary_amount),
    [analytics.top_earners],
  );

  const [departmentPage, setDepartmentPage] = useState(1);
  const [countryPage, setCountryPage] = useState(1);
  const [topEarnersPage, setTopEarnersPage] = useState(1);

  const pagedDepartments = paginate(departmentRows, departmentPage, PAGE_SIZE);
  const pagedCountries = paginate(countryRows, countryPage, PAGE_SIZE);
  const pagedEarners = paginate(topEarners, topEarnersPage, PAGE_SIZE);

  return (
    <div className="stack">
      <article className="card table-card">
        <div className="table-card-header">
          <div>
            <p className="kicker">Department summary</p>
            <h2>Payroll and headcount by department</h2>
          </div>
          <div className="muted pager-summary">
            Showing {pagedDepartments.start}-{pagedDepartments.end} of {departmentRows.length}
          </div>
        </div>
        <div className="table-wrap">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Currency</th>
                <th>Average salary</th>
                <th>Headcount</th>
                <th>Total payroll</th>
              </tr>
            </thead>
            <tbody>
              {pagedDepartments.items.map((department) => (
                <tr key={`${department.department}-${department.currency}`}>
                  <td>{department.department}</td>
                  <td>
                    <span className="pill">{department.currency}</span>
                  </td>
                  <td>{department.avg_salary.toLocaleString()}</td>
                  <td>{department.headcount.toLocaleString()}</td>
                  <td>{department.total_payroll.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager
          currentPage={departmentPage}
          totalPages={pagedDepartments.totalPages}
          onPageChange={setDepartmentPage}
        />
      </article>

      <div className="columns-2">
        <article className="card table-card">
          <div className="table-card-header">
            <div>
              <p className="kicker">Country summary</p>
              <h2>Salary by country</h2>
            </div>
            <div className="muted pager-summary">
              Showing {pagedCountries.start}-{pagedCountries.end} of {countryRows.length}
            </div>
          </div>
          <div className="table-wrap">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Average salary</th>
                  <th>Headcount</th>
                </tr>
              </thead>
              <tbody>
                {pagedCountries.items.map((country) => (
                  <tr key={country.country}>
                    <td>{country.country}</td>
                    <td>{country.avg_salary.toLocaleString()}</td>
                    <td>{country.headcount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager currentPage={countryPage} totalPages={pagedCountries.totalPages} onPageChange={setCountryPage} />
        </article>

        <article className="card table-card">
          <div className="table-card-header">
            <div>
              <p className="kicker">Top earners</p>
              <h2>Highest paid employees</h2>
            </div>
            <div className="muted pager-summary">
              Showing {pagedEarners.start}-{pagedEarners.end} of {topEarners.length}
            </div>
          </div>
          <div className="table-wrap">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody>
                {pagedEarners.items.map((employee) => (
                  <tr key={employee.employee_id}>
                    <td>
                      <strong>{employee.full_name}</strong>
                      <div className="muted">{employee.job_title}</div>
                    </td>
                    <td>{employee.department}</td>
                    <td>
                      <span className="pill">
                        {employee.currency} {employee.salary_amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager currentPage={topEarnersPage} totalPages={pagedEarners.totalPages} onPageChange={setTopEarnersPage} />
        </article>
      </div>

      <article className="card table-card">
        <div className="table-card-header">
          <div>
            <p className="kicker">Salary distribution</p>
            <h2>Histogram buckets</h2>
          </div>
        </div>
        <div className="distribution-grid">
          {analytics.salary_distribution.map((bucket) => (
            <div key={bucket.bucket} className="distribution-row">
              <div className="distribution-meta">
                <span>{bucket.bucket}</span>
                <strong>{bucket.count.toLocaleString()}</strong>
              </div>
              <div className="distribution-track">
                <div className="distribution-fill" style={{ width: `${Math.max(8, Math.min(100, bucket.count * 10))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function Pager({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(currentPage, totalPages);

  return (
    <div className="pagination-row">
      <div className="pagination">
        <button className={`pagination-button ${currentPage <= 1 ? "is-disabled" : ""}`} onClick={() => onPageChange(Math.max(1, currentPage - 1))} type="button">
          Prev
        </button>

        <div className="pagination-pages">
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                …
              </span>
            ) : (
              <button
                key={page}
                className={`pagination-page ${page === currentPage ? "is-active" : ""}`}
                onClick={() => onPageChange(page)}
                type="button"
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          className={`pagination-button ${currentPage >= totalPages ? "is-disabled" : ""}`}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: pageItems,
    start: items.length === 0 ? 0 : startIndex + 1,
    end: startIndex + pageItems.length,
    totalPages,
  };
}

function buildPages(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  if (windowStart > 2) {
    pages.push("ellipsis");
  }

  for (let page = windowStart; page <= windowEnd; page += 1) {
    pages.push(page);
  }

  if (windowEnd < totalPages - 1) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);
  return pages;
}
