import Link from "next/link";

import { AnalyticsTables } from "@/components/AnalyticsTables";
import { fetchAnalytics } from "@/lib/api";

export default async function AnalyticsPage() {
  const analyticsResult = await fetchAnalytics().catch(() => null);

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <h1>Analytics</h1>
          <div className="hero-actions">
            <Link href="/" className="button-secondary">
              Back to directory
            </Link>
          </div>
        </section>

        <section className="section">
          {analyticsResult ? (
            <AnalyticsTables analytics={analyticsResult} />
          ) : (
            <article className="card">
              <h2>Analytics unavailable</h2>
              <p className="muted">Connect the backend to load the payroll and headcount tables.</p>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
