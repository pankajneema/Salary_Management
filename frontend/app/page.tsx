import Link from "next/link";

import { CsvTransferBar } from "@/components/CsvTransferBar";
import { DirectoryControls } from "@/components/DirectoryControls";
import { EmployeeTableWrapper } from "@/components/EmployeeTableWrapper";
import { Pagination } from "@/components/Pagination";
import { fetchAnalytics, fetchDepartments, fetchEmployees } from "@/lib/api";

type HomePageProps = {
  searchParams?: {
    page?: string;
    search?: string;
    department_id?: string;
    country?: string;
    employment_type?: string;
    currency?: string;
    sort_by?: string;
    sort_order?: string;
  };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const currentPage = Number(searchParams?.page ?? "1") || 1;
  const currentSortBy = searchParams?.sort_by ?? "created_at";
  const currentSortOrder = searchParams?.sort_order ?? "desc";
  const [employeesResult, departmentsResult, analyticsResult] = await Promise.allSettled([
    fetchEmployees({
      page: currentPage,
      pageSize: 10,
      search: searchParams?.search,
      departmentId: searchParams?.department_id,
      country: searchParams?.country,
      employmentType: searchParams?.employment_type,
      currency: searchParams?.currency,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
    }),
    fetchDepartments(),
    fetchAnalytics(),
  ]);

  const employees = employeesResult.status === "fulfilled" ? employeesResult.value.items : [];
  const employeePager =
    employeesResult.status === "fulfilled"
      ? {
          page: employeesResult.value.page,
          totalPages: employeesResult.value.total_pages,
          total: employeesResult.value.total,
          pageSize: employeesResult.value.page_size,
        }
      : null;
  const departments = departmentsResult.status === "fulfilled" ? departmentsResult.value : [];
  const analytics = analyticsResult.status === "fulfilled" ? analyticsResult.value : null;
  const analyticsDepartmentCount = analytics?.by_department.length ?? null;
  const currentParams = {
    search: searchParams?.search,
    department_id: searchParams?.department_id,
    country: searchParams?.country,
    employment_type: searchParams?.employment_type,
    currency: searchParams?.currency,
    sort_by: currentSortBy,
    sort_order: currentSortOrder,
  };

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <h1>Salary management</h1>
          <div className="hero-actions">
            <Link href="/analytics" className="button-secondary">
              View analytics
            </Link>
            <Link href="/" className="button">
              Employee directory
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="summary-grid">
            <article className="card summary-card">
              <p className="kicker">Employee directory</p>
              <strong>{employeePager?.total?.toLocaleString() ?? "—"}</strong>
              <span className="muted">Total employees in the current dataset</span>
            </article>
            <article className="card summary-card">
              <p className="kicker">Active records</p>
              <strong>{analytics?.total_active?.toLocaleString() ?? "—"}</strong>
              <span className="muted">Currently active employee profiles</span>
            </article>
            <article className="card summary-card">
              <p className="kicker">Analytics</p>
              <strong>{analyticsDepartmentCount !== null ? analyticsDepartmentCount.toLocaleString() : "—"}</strong>
              <span className="muted">Department groups in payroll analytics</span>
            </article>
          </div>
        </section>

        <section className="section">
          <DirectoryControls
            departments={departments}
            current={{
              search: searchParams?.search,
              departmentId: searchParams?.department_id,
              country: searchParams?.country,
              employmentType: searchParams?.employment_type,
              currency: searchParams?.currency,
              sortBy: currentSortBy,
              sortOrder: currentSortOrder,
            }}
          />
          <CsvTransferBar queryParams={currentParams} />
          {employees.length > 0 ? (
            <>
              <EmployeeTableWrapper
                employees={employees}
                departments={departments}
                currentParams={currentParams}
                currentSortBy={currentSortBy}
                currentSortOrder={currentSortOrder}
              />
              {employeePager ? (
                <div className="pagination-row">
                  <Pagination
                    currentPage={employeePager.page}
                    totalPages={employeePager.totalPages}
                    currentParams={currentParams}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <article className="card">
              <h2>No records loaded yet</h2>
              <p className="muted">
                Start the backend, seed the database, and the first ten employees will appear here.
              </p>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
