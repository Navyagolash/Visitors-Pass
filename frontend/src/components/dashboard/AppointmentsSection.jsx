import { SectionCard } from "../SectionCard";

export function AppointmentsSection({ appointments, busyAction, onApprove, onIssuePass }) {
  return (
    <SectionCard title="Appointments Queue" subtitle="Approve requests and generate visitor passes.">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Host</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="5" className="muted">No appointments found for the selected filters.</td>
              </tr>
            ) : null}
            {appointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>{appointment.visitorId?.fullName}</td>
                <td>{appointment.hostId?.name}</td>
                <td>{new Date(appointment.visitDate).toLocaleString()}</td>
                <td>
                  <span className={`status-pill ${appointment.status}`}>{appointment.status}</span>
                </td>
                <td className="table-actions">
                  <button
                    className="ghost-button"
                    disabled={busyAction === `appointment-${appointment._id}-approved`}
                    onClick={() => onApprove(appointment._id, "approved")}
                  >
                    {busyAction === `appointment-${appointment._id}-approved` ? "Approving..." : "Approve"}
                  </button>
                  <button
                    className="ghost-button"
                    disabled={busyAction === `appointment-${appointment._id}-rejected`}
                    onClick={() => onApprove(appointment._id, "rejected")}
                  >
                    {busyAction === `appointment-${appointment._id}-rejected` ? "Rejecting..." : "Reject"}
                  </button>
                  {appointment.status === "approved" ? (
                    <button
                      className="primary-button"
                      disabled={busyAction === `issue-pass-${appointment._id}`}
                      onClick={() => onIssuePass(appointment._id)}
                    >
                      {busyAction === `issue-pass-${appointment._id}` ? "Issuing..." : "Issue Pass"}
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
