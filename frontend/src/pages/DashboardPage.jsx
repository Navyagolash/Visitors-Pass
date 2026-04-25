import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../state/AuthContext";

const appointmentSeed = {
  visitorId: "",
  hostId: "",
  visitDate: "",
  purpose: "",
  notes: ""
};

const visitorSeed = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  purpose: "",
  photoUrl: ""
};

export function DashboardPage() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [passes, setPasses] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0
  });
  const [visitorForm, setVisitorForm] = useState(visitorSeed);
  const [appointmentForm, setAppointmentForm] = useState(appointmentSeed);
  const [users, setUsers] = useState([]);
  const [passCode, setPassCode] = useState("");
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [message, setMessage] = useState("");
  const loadData = async () => {
    const [visitorData, appointmentData, passData] = await Promise.all([
      apiFetch("/visitors"),
      apiFetch("/appointments"),
      apiFetch("/passes")
    ]);

    setVisitors(visitorData);
    setAppointments(appointmentData);
    setPasses(passData);

    try {
      const statData = await apiFetch("/appointments/stats/summary");
      setStats(statData);
    } catch {
      setStats({
        totalAppointments: appointmentData.length,
        pendingAppointments: appointmentData.filter((item) => item.status === "pending").length,
        approvedAppointments: appointmentData.filter((item) => item.status === "approved").length
      });
    }
  };

  useEffect(() => {
    loadData().catch((error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("vms_user");
    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      setUsers([currentUser]);
      setAppointmentForm((form) => ({ ...form, hostId: currentUser.id || currentUser._id }));
    }
  }, []);

  const createVisitor = async (event) => {
    event.preventDefault();
    await apiFetch("/visitors", {
      method: "POST",
      body: JSON.stringify(visitorForm)
    });
    setVisitorForm(visitorSeed);
    setMessage("Visitor registered successfully.");
    loadData();
  };

  const createAppointment = async (event) => {
    event.preventDefault();
    await apiFetch("/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentForm)
    });
    setAppointmentForm({ ...appointmentSeed, hostId: appointmentForm.hostId });
    setMessage("Appointment created and notification triggered.");
    loadData();
  };

  const approveAppointment = async (appointmentId, status) => {
    await apiFetch(`/appointments/${appointmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    setMessage(`Appointment ${status}.`);
    loadData();
  };

  const issuePass = async (appointmentId) => {
    const pass = await apiFetch("/passes", {
      method: "POST",
      body: JSON.stringify({ appointmentId })
    });
    setPassCode(pass.passCode);
    setVerifiedPass(pass);
    setMessage("Visitor pass issued.");
    loadData();
  };

  const verifyPass = async (code = passCode) => {
    if (!code) {
      setMessage("Enter or select a pass code first.");
      return null;
    }

    const data = await apiFetch(`/passes/verify/${code}`);
    setVerifiedPass(data);
    setPassCode(data.passCode);
    return data;
  };

  const scanPass = async (action) => {
    const activeCode = verifiedPass?.passCode || passCode;
    if (!activeCode) {
      setMessage("Verify or select a pass before scanning.");
      return;
    }

    await apiFetch(`/passes/scan/${activeCode}`, {
      method: "POST",
      body: JSON.stringify({ action, location: "Main Gate", notes: `Processed by ${user.role}` })
    });
    setMessage(`Pass ${action === "check_in" ? "checked in" : "checked out"}.`);
    await verifyPass(activeCode);
    loadData();
  };

  const selectPass = async (code) => {
    setPassCode(code);
    await verifyPass(code);
  };

  const exportLogs = async () => {
    const csv = await apiFetch("/passes/logs/export");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "check-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard">
      <header className="hero-card">
        <div>
          <p className="eyebrow">MERN Assignment</p>
          <h2>Digital visitor operations for organizations</h2>
          <p className="muted">
            Covers authentication, visitor onboarding, appointments, QR-based pass issuance, and
            check-in/check-out logging.
          </p>
        </div>
        <div className="hero-grid">
          <StatCard label="Appointments" value={stats.totalAppointments} accent="teal" />
          <StatCard label="Pending" value={stats.pendingAppointments} accent="orange" />
          <StatCard label="Approved" value={stats.approvedAppointments} accent="pink" />
        </div>
      </header>

      {message ? <div className="success-box">{message}</div> : null}

      <div className="dashboard-grid">
        <SectionCard
          title="Register Visitor"
          subtitle="Pre-register a visitor with contact details and photo reference."
        >
          <form className="stack" onSubmit={createVisitor}>
            <div className="grid two">
              <label>
                Full Name
                <input
                  value={visitorForm.fullName}
                  onChange={(e) => setVisitorForm({ ...visitorForm, fullName: e.target.value })}
                />
              </label>
              <label>
                Company
                <input
                  value={visitorForm.company}
                  onChange={(e) => setVisitorForm({ ...visitorForm, company: e.target.value })}
                />
              </label>
            </div>
            <div className="grid two">
              <label>
                Email
                <input
                  value={visitorForm.email}
                  onChange={(e) => setVisitorForm({ ...visitorForm, email: e.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  value={visitorForm.phone}
                  onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                />
              </label>
            </div>
            <label>
              Purpose
              <input
                value={visitorForm.purpose}
                onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
              />
            </label>
            <label>
              Photo URL
              <input
                value={visitorForm.photoUrl}
                onChange={(e) => setVisitorForm({ ...visitorForm, photoUrl: e.target.value })}
              />
            </label>
            <button className="primary-button" type="submit">
              Save Visitor
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Create Appointment"
          subtitle="Invite a visitor for an approved meeting and notify them."
        >
          <form className="stack" onSubmit={createAppointment}>
            <div className="grid two">
              <label>
                Visitor
                <select
                  value={appointmentForm.visitorId}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, visitorId: e.target.value })}
                >
                  <option value="">Select visitor</option>
                  {visitors.map((visitor) => (
                    <option key={visitor._id} value={visitor._id}>
                      {visitor.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Host
                <select
                  value={appointmentForm.hostId}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, hostId: e.target.value })}
                >
                  <option value="">Select host</option>
                  {users.map((host) => (
                    <option key={host.id || host._id} value={host.id || host._id}>
                      {host.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Visit Date & Time
              <input
                type="datetime-local"
                value={appointmentForm.visitDate}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, visitDate: e.target.value })}
              />
            </label>
            <label>
              Purpose
              <input
                value={appointmentForm.purpose}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, purpose: e.target.value })}
              />
            </label>
            <label>
              Notes
              <textarea
                rows="3"
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
              />
            </label>
            <button className="primary-button" type="submit">
              Create Appointment
            </button>
          </form>
        </SectionCard>
      </div>

      <div className="dashboard-grid">
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
                        onClick={() => approveAppointment(appointment._id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="ghost-button"
                        onClick={() => approveAppointment(appointment._id, "rejected")}
                      >
                        Reject
                      </button>
                      {appointment.status === "approved" ? (
                        <button className="primary-button" onClick={() => issuePass(appointment._id)}>
                          Issue Pass
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Pass Scanner" subtitle="Verify a pass code and process entry or exit.">
          <div className="stack">
            <label>
              Pass Code
              <input value={passCode} onChange={(e) => setPassCode(e.target.value.toUpperCase())} />
            </label>
            <div className="inline-actions">
              <button className="primary-button" onClick={verifyPass}>
                Verify Pass
              </button>
              <button className="ghost-button" onClick={() => scanPass("check_in")}>
                Check In
              </button>
              <button className="ghost-button" onClick={() => scanPass("check_out")}>
                Check Out
              </button>
              <button className="ghost-button link-button" onClick={exportLogs}>
                Export Logs
              </button>
            </div>

            {verifiedPass ? (
              <div className="pass-preview">
                <div>
                  <h4>{verifiedPass.visitorId?.fullName}</h4>
                  <p className="muted">Host: {verifiedPass.hostId?.name}</p>
                  <p className="muted">Status: {verifiedPass.status}</p>
                  <p className="muted">Code: {verifiedPass.passCode}</p>
                </div>
                {verifiedPass.qrImage ? <img src={verifiedPass.qrImage} alt="QR pass" /> : null}
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Issued Passes" subtitle="Digital badges generated for visitors.">
        <div className="pass-grid">
          {passes.map((pass) => (
            <article className="pass-card" key={pass._id} onClick={() => selectPass(pass.passCode)} role="button" tabIndex={0}>
              <div>
                <p className="eyebrow">{pass.passCode}</p>
                <h4>{pass.visitorId?.fullName}</h4>
                <p className="muted">{pass.appointmentId?.purpose}</p>
                <span className={`status-pill ${pass.status}`}>{pass.status}</span>
              </div>
              {pass.qrImage ? <img src={pass.qrImage} alt={pass.passCode} /> : <div className="qr-fallback">QR</div>}
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
