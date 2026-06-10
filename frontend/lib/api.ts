export type Department = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  employee_id: string;
  full_name: string;
  job_title: string;
  department_id: string;
  department_name?: string | null;
  employment_type: string;
  country: string;
  salary_amount: string;
  currency: string;
  date_of_joining: string;
  is_active: boolean;
};

export type EmployeeListResponse = {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type EmployeeListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  country?: string;
  employmentType?: string;
  currency?: string;
  sortBy?: string;
  sortOrder?: string;
};

export type AnalyticsSummary = {
  total_employees: number;
  total_active: number;
  by_department: Array<{
    department: string;
    avg_salary: number;
    headcount: number;
    total_payroll: number;
    currency: string;
  }>;
  by_country: Array<{
    country: string;
    avg_salary: number;
    headcount: number;
  }>;
  top_earners: Array<{
    employee_id: string;
    full_name: string;
    job_title: string;
    department: string;
    salary_amount: number;
    currency: string;
  }>;
  salary_distribution: Array<{
    bucket: string;
    count: number;
  }>;
};

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchEmployees(params: EmployeeListParams = {}) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("page_size", String(params.pageSize ?? 10));

  if (params.search) searchParams.set("search", params.search);
  if (params.departmentId) searchParams.set("department_id", params.departmentId);
  if (params.country) searchParams.set("country", params.country);
  if (params.employmentType) searchParams.set("employment_type", params.employmentType);
  if (params.currency) searchParams.set("currency", params.currency);
  if (params.sortBy) searchParams.set("sort_by", params.sortBy);
  if (params.sortOrder) searchParams.set("sort_order", params.sortOrder);

  return request<EmployeeListResponse>(`/api/employees?${searchParams.toString()}`);
}

export function fetchAnalytics() {
  return request<AnalyticsSummary>("/api/analytics/summary");
}

export function fetchDepartments() {
  return request<Department[]>("/api/departments");
}

export async function createEmployee(data: {
  full_name: string;
  job_title: string;
  department_id: string;
  employment_type: string;
  country: string;
  salary_amount: string;
  currency: string;
  date_of_joining: string;
}): Promise<Employee> {
  const response = await fetch(`${apiBaseUrl}/api/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create employee: ${response.status}`);
  }

  return response.json() as Promise<Employee>;
}

export async function updateEmployee(
  employeeId: string,
  data: Partial<{
    full_name: string;
    job_title: string;
    department_id: string;
    employment_type: string;
    country: string;
  }>
): Promise<Employee> {
  const response = await fetch(`${apiBaseUrl}/api/employees/${employeeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update employee: ${response.status}`);
  }

  return response.json() as Promise<Employee>;
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/employees/${employeeId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete employee: ${response.status}`);
  }
}
