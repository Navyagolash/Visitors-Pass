import { SectionCard } from "../SectionCard";

export function AppointmentFormSection({
  form,
  errors = {},
  visitors,
  users,
  busy,
  onChange,
  onSubmit
}) {
  return (
    <SectionCard
      title="Create Appointment"
      subtitle="Invite a visitor for an approved meeting and notify them."
    >
      <form className="stack" onSubmit={onSubmit}>
        <div className="grid two">
          <label>
            Visitor
            <select value={form.visitorId} onChange={(e) => onChange("visitorId", e.target.value)} required>
              <option value="">Select visitor</option>
              {visitors.map((visitor) => (
                <option key={visitor._id} value={visitor._id}>
                  {visitor.fullName}
                </option>
              ))}
            </select>
            {errors.visitorId ? <span className="field-error">{errors.visitorId}</span> : null}
          </label>
          <label>
            Host
            <select value={form.hostId} onChange={(e) => onChange("hostId", e.target.value)} required>
              <option value="">Select host</option>
              {users.map((host) => (
                <option key={host.id || host._id} value={host.id || host._id}>
                  {host.name}
                </option>
              ))}
            </select>
            {errors.hostId ? <span className="field-error">{errors.hostId}</span> : null}
          </label>
        </div>
        <label>
          Visit Date & Time
          <input
            type="datetime-local"
            value={form.visitDate}
            onChange={(e) => onChange("visitDate", e.target.value)}
            required
          />
          {errors.visitDate ? <span className="field-error">{errors.visitDate}</span> : null}
        </label>
        <label>
          Purpose
          <input value={form.purpose} onChange={(e) => onChange("purpose", e.target.value)} required />
          {errors.purpose ? <span className="field-error">{errors.purpose}</span> : null}
        </label>
        <label>
          Notes
          <textarea rows="3" value={form.notes} onChange={(e) => onChange("notes", e.target.value)} />
        </label>
        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create Appointment"}
        </button>
      </form>
    </SectionCard>
  );
}
