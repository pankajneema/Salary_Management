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

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchEmployees() {
  return request<EmployeeListResponse>("/api/employees?page=1&page_size=8");
}

export function fetchAnalytics() {
  return request<AnalyticsSummary>("/api/analytics/summary");
}

export function fetchDepartments() {
  return request<Department[]>("/api/departments");
}
