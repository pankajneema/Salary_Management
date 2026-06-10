import Link from "next/link";

import type { Employee } from "@/lib/api";

type DirectoryTableProps = {
  employees: Employee[];
  currentParams: Record<string, string | undefined>;
  currentSortBy: string;
  currentSortOrder: string;
};

const sortableColumns = [
  { key: "full_name", label: "Employee" },
  { key: "job_title", label: "Role" },
  { key: "department_name", label: "Department" },
  { key: "country", label: "Country" },
  { key: "salary_amount", label: "Salary" },
];

export function DirectoryTable({ employees, currentParams, currentSortBy, currentSortOrder }: DirectoryTableProps) {
  const buildHref = (sortBy: string) => {
    const nextParams = new URLSearchParams();
    if (currentParams.search) nextParams.set("search", currentParams.search);
    if (currentParams.department_id) nextParams.set("department_id", currentParams.department_id);
    if (currentParams.country) nextParams.set("country", currentParams.country);
    if (currentParams.employment_type) nextParams.set("employment_type", currentParams.employment_type);
    if (currentParams.currency) nextParams.set("currency", currentParams.currency);
    const nextOrder = currentSortBy === sortBy && currentSortOrder === "asc" ? "desc" : "asc";
    nextParams.set("sort_by", sortBy);
    nextParams.set("sort_order", nextOrder);
    nextParams.set("page", "1");
    return `/?${nextParams.toString()}`;
  };

  return (
    <div className="table-wrap">
      <table className="compact-table">
        <thead>
          <tr>
            {sortableColumns.map((column) => {
              return (
                <th key={column.key}>
                  <Link className="sort-link" href={buildHref(column.key)} scroll={false}>
                    <span>{column.label}</span>
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
                <strong>{employee.full_name}</strong>
                <div className="muted">{employee.employee_id}</div>
              </td>
              <td>
                <div>{employee.job_title}</div>
                <div className="muted">{employee.employment_type}</div>
              </td>
              <td>{employee.department_name ?? "Unassigned"}</td>
              <td>{employee.country}</td>
              <td>
                <span className="pill">
                  {employee.currency} {Number(employee.salary_amount).toLocaleString()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
