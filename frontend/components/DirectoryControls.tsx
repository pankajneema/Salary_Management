"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import type { Department, EmployeeListParams } from "@/lib/api";

type DirectoryControlsProps = {
  departments: Department[];
  current: EmployeeListParams;
};

const countries = ["India", "United States", "United Kingdom", "Germany", "Australia"];
const employmentTypes = ["full-time", "part-time", "contract"];
const currencies = ["INR", "USD", "GBP", "EUR", "AUD"];

export function DirectoryControls({ departments, current }: DirectoryControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const [search, setSearch] = useState(current.search ?? "");
  const initialRender = useRef(true);

  useEffect(() => {
    setSearch(current.search ?? "");
  }, [current.search]);

  const navigateWithParams = (formData?: FormData) => {
    const nextParams = new URLSearchParams();
    const nextSearch = formData ? String(formData.get("search") ?? "").trim() : search.trim();
    const nextDepartmentId = formData ? String(formData.get("department_id") ?? "") : current.departmentId ?? "";
    const nextCountry = formData ? String(formData.get("country") ?? "") : current.country ?? "";
    const nextEmploymentType = formData ? String(formData.get("employment_type") ?? "") : current.employmentType ?? "";
    const nextCurrency = formData ? String(formData.get("currency") ?? "") : current.currency ?? "";

    if (nextSearch) nextParams.set("search", nextSearch);
    if (nextDepartmentId) nextParams.set("department_id", nextDepartmentId);
    if (nextCountry) nextParams.set("country", nextCountry);
    if (nextEmploymentType) nextParams.set("employment_type", nextEmploymentType);
    if (nextCurrency) nextParams.set("currency", nextCurrency);
    nextParams.set("sort_by", current.sortBy ?? "created_at");
    nextParams.set("sort_order", current.sortOrder ?? "desc");

    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  const navigateFromCurrentForm = () => {
    if (!formRef.current) {
      navigateWithParams();
      return;
    }
    navigateWithParams(new FormData(formRef.current));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    navigateWithParams(formData);
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      navigateFromCurrentForm();
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  return (
    <form ref={formRef} className="directory-controls" onSubmit={handleSubmit}>
      <div className="directory-field directory-search">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          name="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, ID, or title"
        />
      </div>

      <div className="directory-field">
        <label htmlFor="department_id">Department</label>
        <select
          id="department_id"
          name="department_id"
          value={current.departmentId ?? ""}
          onChange={navigateFromCurrentForm}
        >
          <option value="">All</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <div className="directory-field">
        <label htmlFor="country">Country</label>
        <select id="country" name="country" value={current.country ?? ""} onChange={navigateFromCurrentForm}>
          <option value="">All</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className="directory-field">
        <label htmlFor="employment_type">Employment</label>
        <select
          id="employment_type"
          name="employment_type"
          value={current.employmentType ?? ""}
          onChange={navigateFromCurrentForm}
        >
          <option value="">All</option>
          {employmentTypes.map((employmentType) => (
            <option key={employmentType} value={employmentType}>
              {employmentType}
            </option>
          ))}
        </select>
      </div>

      <div className="directory-field">
        <label htmlFor="currency">Currency</label>
        <select id="currency" name="currency" value={current.currency ?? ""} onChange={navigateFromCurrentForm}>
          <option value="">All</option>
          {currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>

      <input type="hidden" name="sort_by" value={current.sortBy ?? "created_at"} />
      <input type="hidden" name="sort_order" value={current.sortOrder ?? "desc"} />

      <div className="directory-actions">
        <button type="submit" className="button">
          Apply filters
        </button>
        <Link href="/" className="button-secondary" scroll={false}>
          Reset
        </Link>
      </div>
    </form>
  );
}
