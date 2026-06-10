type StatCardProps = {
  label: string;
  value: string;
  note?: string;
};

export function StatCard({ label, value, note }: StatCardProps) {
  return (
    <article className="card stat">
      <div className="label">{label}</div>
      <strong className="value">{value}</strong>
      {note ? <p className="muted">{note}</p> : null}
    </article>
  );
}
