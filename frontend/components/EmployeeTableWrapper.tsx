"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DirectoryTable } from "@/components/DirectoryTable";
import { EmployeeModals } from "@/components/EmployeeModals";
import type { Employee, Department } from "@/lib/api";

type EmployeeTableWrapperProps = {
  employees: Employee[];
  departments: Department[];
  currentParams: Record<string, string | undefined>;
  currentSortBy: string;
  currentSortOrder: string;
};

export function EmployeeTableWrapper({
  employees,
  departments,
  currentParams,
  currentSortBy,
  currentSortOrder,
}: EmployeeTableWrapperProps) {
  const modalsRef = useRef<{ openAdd: () => void; openEdit: (emp: Employee) => void; openDelete: (emp: Employee) => void }>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <EmployeeModals ref={modalsRef} departments={departments} onSuccess={handleRefresh} />
      
      <button
        className="button"
        onClick={() => modalsRef.current?.openAdd()}
        style={{ marginBottom: "16px" }}
        disabled={isPending}
      >
        + Add Employee
      </button>

      <DirectoryTable
        employees={employees}
        currentParams={currentParams}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onEdit={(emp) => modalsRef.current?.openEdit(emp)}
        onDelete={(emp) => modalsRef.current?.openDelete(emp)}
      />
    </>
  );
}
