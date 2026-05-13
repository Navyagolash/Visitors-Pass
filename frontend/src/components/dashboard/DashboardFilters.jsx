import { SectionCard } from "../SectionCard";

export function DashboardFilters({ filters, users, onChange, onReset }) {
  return (
    <SectionCard title="Filters" subtitle="Filter appointments and passes by search text, host, status, and date range.">
      <div className="grid three">
        <label>
          Search
          <input value={filters.q} onChange={(e) => onChange("q", e.target.value)} placeholder="Visitor or purpose" />
        </label>
        <label>
          Company
          <input
            value={filters.company}
            onChange={(e) => onChange("company", e.target.value)}
            placeholder="Company name"
          />
        </label>
        <label>
          Status
          <select value={filters.status} onChange={(e) => onChange("status", e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>
          Host
          <select value={filters.hostId} onChange={(e) => onChange("hostId", e.target.value)}>
            <option value="">All hosts</option>
            {users.map((host) => (
              <option key={host.id || host._id} value={host.id || host._id}>
                {host.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date From
          <input type="date" value={filters.dateFrom} onChange={(e) => onChange("dateFrom", e.target.value)} />
        </label>
        <label>
          Date To
          <input type="date" value={filters.dateTo} onChange={(e) => onChange("dateTo", e.target.value)} />
        </label>
      </div>
      <div className="inline-actions">
        <button className="ghost-button" type="button" onClick={onReset}>
          Reset Filters
        </button>
      </div>
    </SectionCard>
  );
}
