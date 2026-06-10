import type { Employee } from "@/lib/api";

type EmployeeTableProps = {
  employees: Employee[];
};

export function EmployeeTable({ employees }: EmployeeTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Role</th>
            <th>Department</th>
            <th>Location</th>
            <th>Salary</th>
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
