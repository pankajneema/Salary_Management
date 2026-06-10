"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent } from "react";

import { apiBaseUrl } from "@/lib/api";

type CsvTransferBarProps = {
  queryParams: Record<string, string | string[] | undefined>;
};

export function CsvTransferBar({ queryParams }: CsvTransferBarProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const exportHref = useMemo(() => {
    const exportParams = new URLSearchParams();
    const departmentId = queryParams.department_id;
    const country = queryParams.country;
    const employmentType = queryParams.employment_type;

    if (departmentId && typeof departmentId === "string") exportParams.set("department_id", departmentId);
    if (country && typeof country === "string") exportParams.set("country", country);
    if (employmentType && typeof employmentType === "string") exportParams.set("employment_type", employmentType);

    const suffix = exportParams.toString();
    return `${apiBaseUrl}/api/export/csv${suffix ? `?${suffix}` : ""}`;
  }, [queryParams]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setBusy(true);
    setStatus("Uploading CSV…");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiBaseUrl}/api/import/csv`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Import failed with status ${response.status}`);
      }

      const result = (await response.json()) as { job_id?: string; status?: string; message?: string };
      if (!result.job_id) {
        setStatus(result.message ?? "CSV import queued.");
        return;
      }

      setStatus("Import queued. Processing in the background…");
      await pollJob(result.job_id);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "CSV import failed.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const pollJob = async (jobId: string) => {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const response = await fetch(`${apiBaseUrl}/api/import/csv/${jobId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Could not read import status (${response.status})`);
      }

      const job = (await response.json()) as {
        status?: string;
        imported_count?: number;
        error_count?: number;
        error_message?: string | null;
      };

      if (job.status === "completed") {
        setStatus(`Imported ${job.imported_count ?? 0} rows${job.error_count ? `, ${job.error_count} errors` : ""}.`);
        return;
      }

      if (job.status === "failed") {
        setStatus(job.error_message ?? "CSV import failed.");
        return;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1000));
    }

    setStatus("CSV import is still processing. Refresh in a moment to see the final result.");
  };

  return (
    <div className="card csv-transfer-bar">
      <div className="csv-transfer-copy">
        <p className="kicker">CSV import/export</p>
        <h2>Move data in or out</h2>
        <p className="muted">Import a CSV to bulk-load employees, or export the current filter set for migration work.</p>
      </div>
      <div className="csv-transfer-actions">
        <label className="button-secondary csv-upload-button">
          <input accept=".csv,text/csv" disabled={busy} onChange={handleUpload} type="file" />
          {busy ? "Uploading…" : "Import CSV"}
        </label>
        <Link href={exportHref} className="button" target="_blank" rel="noreferrer">
          Export CSV
        </Link>
      </div>
      {status ? <p className="csv-transfer-status muted">{status}</p> : null}
    </div>
  );
}
