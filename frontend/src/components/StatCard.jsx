export function StatCard({ label, value, accent }) {
  return (
    <article className={`stat-card stat-card-${accent}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
