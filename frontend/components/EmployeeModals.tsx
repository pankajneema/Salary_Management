"use client";

import { useCallback, useState, useRef, useImperativeHandle, forwardRef } from "react";
import type { Employee, Department } from "@/lib/api";
import type { FormEvent, ChangeEvent } from "react";
import { createEmployee, updateEmployee, deleteEmployee } from "@/lib/api";

type ModalState = "closed" | "add" | "edit" | "delete";

type EmployeeModalsProps = {
  departments: Department[];
  onSuccess: () => void;
};

type FormData = {
  full_name: string;
  job_title: string;
  department_id: string;
  employment_type: string;
  country: string;
  salary_amount: string;
  currency: string;
  date_of_joining: string;
};

const EMPTY_FORM: FormData = {
  full_name: "",
  job_title: "",
  department_id: "",
  employment_type: "full-time",
  country: "",
  salary_amount: "",
  currency: "USD",
  date_of_joining: new Date().toISOString().split("T")[0],
};

export const EmployeeModals = forwardRef<
  { openAdd: () => void; openEdit: (emp: Employee) => void; openDelete: (emp: Employee) => void },
  EmployeeModalsProps
>(({ departments, onSuccess }, ref) => {
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
    setError(null);
  }, []);

  const closeModal = useCallback(() => {
    setModalState("closed");
    setSelectedEmployee(null);
    resetForm();
  }, [resetForm]);

  const openAdd = useCallback(() => {
    resetForm();
    setModalState("add");
  }, [resetForm]);

  const openEdit = useCallback((emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      full_name: emp.full_name,
      job_title: emp.job_title,
      department_id: emp.department_id,
      employment_type: emp.employment_type,
      country: emp.country,
      salary_amount: emp.salary_amount,
      currency: emp.currency,
      date_of_joining: emp.date_of_joining,
    });
    setModalState("edit");
  }, []);

  const openDelete = useCallback((emp: Employee) => {
    setSelectedEmployee(emp);
    setModalState("delete");
  }, []);

  useImperativeHandle(ref, () => ({ openAdd, openEdit, openDelete }), [openAdd, openEdit, openDelete]);

  const handleFormChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await createEmployee(formData);
      onSuccess();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee");
    } finally {
      setBusy(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setBusy(true);
    setError(null);

    try {
      await updateEmployee(selectedEmployee.id, {
        full_name: formData.full_name,
        job_title: formData.job_title,
        department_id: formData.department_id,
        employment_type: formData.employment_type,
        country: formData.country,
      });
      onSuccess();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update employee");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;

    setBusy(true);
    setError(null);

    try {
      await deleteEmployee(selectedEmployee.id);
      onSuccess();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete employee");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Add Employee Modal */}
      {modalState === "add" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Employee</h2>
            <form onSubmit={handleAddSubmit}>
              {error && <div style={{ color: "#d32f2f", marginBottom: "12px" }}>{error}</div>}

              <label>
                Full Name *
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                />
              </label>

              <label>
                Job Title *
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                />
              </label>

              <label>
                Department *
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Employment Type *
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </label>

              <label>
                Country *
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                  placeholder="e.g., India, United States"
                />
              </label>

              <label>
                Salary Amount *
                <input
                  type="number"
                  name="salary_amount"
                  value={formData.salary_amount}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                  min="1"
                  step="0.01"
                />
              </label>

              <label>
                Currency *
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                  placeholder="USD"
                  maxLength={3}
                />
              </label>

              <label>
                Date of Joining *
                <input
                  type="date"
                  name="date_of_joining"
                  value={formData.date_of_joining}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                />
              </label>

              <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "flex-end" }}>
                <button type="button" className="button-secondary" onClick={closeModal} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="button" disabled={busy}>
                  {busy ? "Creating..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {modalState === "edit" && selectedEmployee && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Employee</h2>
            <form onSubmit={handleEditSubmit}>
              {error && <div style={{ color: "#d32f2f", marginBottom: "12px" }}>{error}</div>}

              <label>
                Full Name *
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                />
              </label>

              <label>
                Job Title *
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                />
              </label>

              <label>
                Department *
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Employment Type *
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </label>

              <label>
                Country *
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                  required
                  disabled={busy}
                />
              </label>

              <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "flex-end" }}>
                <button type="button" className="button-secondary" onClick={closeModal} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="button" disabled={busy}>
                  {busy ? "Updating..." : "Update Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalState === "delete" && selectedEmployee && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Employee</h2>
            {error && <div style={{ color: "#d32f2f", marginBottom: "12px" }}>{error}</div>}
            <p>Are you sure you want to delete <strong>{selectedEmployee.full_name}</strong>? This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "flex-end" }}>
              <button type="button" className="button-secondary" onClick={closeModal} disabled={busy}>
                Cancel
              </button>
              <button
                type="button"
                className="button"
                onClick={handleDeleteConfirm}
                disabled={busy}
                style={{ backgroundColor: "#d32f2f" }}
              >
                {busy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Styles */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .modal-content h2 {
          margin: 0 0 16px;
          font-size: 1.5rem;
        }

        .modal-content p {
          margin: 0 0 12px;
          line-height: 1.5;
        }

        .modal-content label {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
          font-weight: 500;
          gap: 6px;
        }

        .modal-content input,
        .modal-content select {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font: inherit;
          font-size: 1rem;
        }

        .modal-content input:disabled,
        .modal-content select:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .modal-content button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font: inherit;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .modal-content .button {
          background: #0066cc;
          color: white;
        }

        .modal-content .button:hover:not(:disabled) {
          background: #0052a3;
        }

        .modal-content .button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .modal-content .button-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .modal-content .button-secondary:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .modal-content .button-secondary:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
});

EmployeeModals.displayName = "EmployeeModals";
