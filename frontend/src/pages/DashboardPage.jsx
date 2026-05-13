import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { StatCard } from "../components/StatCard";
import { ToastMessage } from "../components/ToastMessage";
import { useAuth } from "../state/AuthContext";
import { AppointmentFormSection } from "../components/dashboard/AppointmentFormSection";
import { AppointmentsSection } from "../components/dashboard/AppointmentsSection";
import { DashboardFilters } from "../components/dashboard/DashboardFilters";
import { IssuedPassesSection } from "../components/dashboard/IssuedPassesSection";
import { PassScannerSection } from "../components/dashboard/PassScannerSection";
import { VisitorFormSection } from "../components/dashboard/VisitorFormSection";

const emptyAppointmentForm = {
  visitorId: "",
  hostId: "",
  visitDate: "",
  purpose: "",
  notes: ""
};

const emptyVisitorForm = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  purpose: "",
  photoUrl: "",
  photoFile: null
};

const emptyFilters = {
  q: "",
  company: "",
  status: "",
  hostId: "",
  dateFrom: "",
  dateTo: ""
};

const buildQueryString = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  return params.toString();
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = (value) => /^\+?[0-9]{10,15}$/.test(value.replace(/\s/g, ""));

const validateVisitorForm = (form) => {
  const errors = {};

  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!form.company.trim()) errors.company = "Company is required.";
  if (!isEmail(form.email)) errors.email = "Enter a valid email address.";
  if (!isPhone(form.phone)) errors.phone = "Enter a valid phone number.";
  if (!form.purpose.trim()) errors.purpose = "Purpose is required.";

  if (form.photoFile) {
    if (!form.photoFile.type.startsWith("image/")) errors.photoFile = "Upload an image file.";
    if (form.photoFile.size > 2 * 1024 * 1024) errors.photoFile = "Photo must be under 2 MB.";
  }

  return errors;
};

const validateAppointmentForm = (form) => {
  const errors = {};

  if (!form.visitorId) errors.visitorId = "Choose a visitor.";
  if (!form.hostId) errors.hostId = "Choose a host.";
  if (!form.visitDate) errors.visitDate = "Choose a visit date and time.";
  if (!form.purpose.trim()) errors.purpose = "Purpose is required.";

  return errors;
};

export function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [passes, setPasses] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0
  });
  const [users, setUsers] = useState([]);
  const [visitorForm, setVisitorForm] = useState(emptyVisitorForm);
  const [appointmentForm, setAppointmentForm] = useState(emptyAppointmentForm);
  const [filters, setFilters] = useState(emptyFilters);
  const [passCode, setPassCode] = useState("");
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [toast, setToast] = useState(null);
  const [busyAction, setBusyAction] = useState("");
  const [visitorErrors, setVisitorErrors] = useState({});
  const [appointmentErrors, setAppointmentErrors] = useState({});
  const [passError, setPassError] = useState("");

  const loadDashboardData = async (filterValues = filters) => {
    const queryString = buildQueryString(filterValues);
    const suffix = queryString ? `?${queryString}` : "";

    const [visitorData, appointmentData, passData] = await Promise.all([
      apiFetch(`/visitors${suffix}`),
      apiFetch(`/appointments${suffix}`),
      apiFetch(`/passes${suffix}`)
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
    loadDashboardData().catch((error) => {
      setToast({ type: "error", title: "Load failed", text: error.message });
    });
  }, []);

  useEffect(() => {
    if (!location.state?.flash) {
      return;
    }

    setToast(location.state.flash);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  useEffect(() => {
    const storedUser = localStorage.getItem("vms_user");
    if (!storedUser) {
      return;
    }

    const currentUser = JSON.parse(storedUser);
    setUsers([currentUser]);
    setAppointmentForm((current) => ({ ...current, hostId: currentUser.id || currentUser._id }));
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleVisitorFieldChange = (field, value) => {
    setVisitorForm((current) => ({ ...current, [field]: value }));
    setVisitorErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleAppointmentFieldChange = (field, value) => {
    setAppointmentForm((current) => ({ ...current, [field]: value }));
    setAppointmentErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleFilterChange = (field, value) => {
    const nextFilters = { ...filters, [field]: value };
    setFilters(nextFilters);
    loadDashboardData(nextFilters).catch((error) => {
      setToast({ type: "error", title: "Filter failed", text: error.message });
    });
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    loadDashboardData(emptyFilters).catch((error) => {
      setToast({ type: "error", title: "Filter failed", text: error.message });
    });
  };

  const createVisitor = async (event) => {
    event.preventDefault();
    const errors = validateVisitorForm(visitorForm);

    if (Object.keys(errors).length > 0) {
      setVisitorErrors(errors);
      setToast({ type: "error", title: "Check visitor form", text: "Fix the highlighted fields before saving." });
      return;
    }

    const formData = new FormData();
    formData.append("fullName", visitorForm.fullName);
    formData.append("email", visitorForm.email);
    formData.append("phone", visitorForm.phone);
    formData.append("company", visitorForm.company);
    formData.append("purpose", visitorForm.purpose);
    if (visitorForm.photoUrl) {
      formData.append("photoUrl", visitorForm.photoUrl);
    }
    if (visitorForm.photoFile) {
      formData.append("photo", visitorForm.photoFile);
    }

    try {
      setBusyAction("create-visitor");
      await apiFetch("/visitors", {
        method: "POST",
        body: formData
      });
      setVisitorForm(emptyVisitorForm);
      setVisitorErrors({});
      setToast({ type: "success", title: "Visitor saved", text: "Visitor registered successfully." });
      await loadDashboardData();
    } catch (error) {
      setToast({ type: "error", title: "Visitor save failed", text: error.message });
    } finally {
      setBusyAction("");
    }
  };

  const createAppointment = async (event) => {
    event.preventDefault();
    const errors = validateAppointmentForm(appointmentForm);

    if (Object.keys(errors).length > 0) {
      setAppointmentErrors(errors);
      setToast({ type: "error", title: "Check appointment form", text: "Fix the highlighted fields before creating." });
      return;
    }

    try {
      setBusyAction("create-appointment");
      await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify(appointmentForm)
      });
      setAppointmentForm({
        ...emptyAppointmentForm,
        hostId: appointmentForm.hostId
      });
      setToast({
        type: "success",
        title: "Appointment created",
        text: "Appointment created and notification triggered."
      });
      setAppointmentErrors({});
      await loadDashboardData();
    } catch (error) {
      setToast({ type: "error", title: "Appointment failed", text: error.message });
    } finally {
      setBusyAction("");
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      setBusyAction(`appointment-${appointmentId}-${status}`);
      await apiFetch(`/appointments/${appointmentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      setToast({ type: "success", title: "Appointment updated", text: `Appointment ${status}.` });
      await loadDashboardData();
    } catch (error) {
      setToast({ type: "error", title: "Update failed", text: error.message });
    } finally {
      setBusyAction("");
    }
  };

  const issuePass = async (appointmentId) => {
    try {
      setBusyAction(`issue-pass-${appointmentId}`);
      const pass = await apiFetch("/passes", {
        method: "POST",
        body: JSON.stringify({ appointmentId })
      });
      setPassCode(pass.passCode);
      setVerifiedPass(pass);
      setToast({ type: "success", title: "Pass issued", text: "Visitor pass issued." });
      await loadDashboardData();
    } catch (error) {
      setToast({ type: "error", title: "Pass issue failed", text: error.message });
    } finally {
      setBusyAction("");
    }
  };

  const verifyPass = async (code = passCode) => {
    const cleanCode = code.trim();

    if (!cleanCode) {
      setPassError("Enter or scan a pass code first.");
      setToast({ type: "error", title: "Pass code required", text: "Enter or scan a pass code first." });
      return;
    }

    try {
      setBusyAction("verify-pass");
      const pass = await apiFetch(`/passes/verify/${cleanCode}`);
      setPassCode(pass.passCode);
      setVerifiedPass(pass);
      setPassError("");
      setToast({
        type: "success",
        title: "Pass verified",
        text: `Pass ${pass.passCode} verified successfully.`
      });
    } catch (error) {
      setPassError(error.message);
      setToast({ type: "error", title: "Verify failed", text: error.message });
    } finally {
      setBusyAction("");
    }
  };

  const scanPass = async (action) => {
    const activeCode = verifiedPass?.passCode || passCode;
    if (!activeCode) {
      setPassError("Verify or scan a pass before check-in or check-out.");
      setToast({ type: "error", title: "Verify pass first", text: "Verify or scan a pass before check-in or check-out." });
      return;
    }

    try {
      setBusyAction(action);
      await apiFetch(`/passes/scan/${activeCode}`, {
        method: "POST",
        body: JSON.stringify({ action, location: "Main Gate", notes: `Processed by ${user.role}` })
      });
      setToast({
        type: "success",
        title: action === "check_in" ? "Checked in" : "Checked out",
        text: action === "check_in" ? "Visitor checked in successfully." : "Visitor checked out successfully."
      });
      await verifyPass(activeCode);
      await loadDashboardData();
    } catch (error) {
      setToast({ type: "error", title: "Scan failed", text: error.message });
    } finally {
      setBusyAction("");
    }
  };

  const exportLogs = async () => {
    try {
      setBusyAction("export-logs");
      const csv = await apiFetch("/passes/logs/export");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "check-logs.csv";
      link.click();
      URL.revokeObjectURL(url);
      setToast({ type: "success", title: "Export complete", text: "Check logs exported successfully." });
    } catch (error) {
      setToast({ type: "error", title: "Export failed", text: error.message });
    } finally {
      setBusyAction("");
    }
  };

  return (
    <div className="dashboard">
      <ToastMessage toast={toast} onClose={() => setToast(null)} />

      <header className="hero-card">
        <div>
          <p className="eyebrow">MERN Assignment</p>
          <h2>Digital visitor operations for organizations</h2>
          <p className="muted">
            Covers authentication, visitor onboarding, appointments, QR-based pass issuance, and check-in/check-out logging.
          </p>
        </div>
        <div className="hero-grid">
          <StatCard label="Appointments" value={stats.totalAppointments} accent="teal" />
          <StatCard label="Pending" value={stats.pendingAppointments} accent="orange" />
          <StatCard label="Approved" value={stats.approvedAppointments} accent="pink" />
        </div>
      </header>

      <DashboardFilters filters={filters} users={users} onChange={handleFilterChange} onReset={resetFilters} />

      <div className="dashboard-grid">
        <VisitorFormSection
          form={visitorForm}
          errors={visitorErrors}
          busy={busyAction === "create-visitor"}
          onChange={handleVisitorFieldChange}
          onFileChange={(file) => handleVisitorFieldChange("photoFile", file)}
          onSubmit={createVisitor}
        />
        <AppointmentFormSection
          form={appointmentForm}
          errors={appointmentErrors}
          visitors={visitors}
          users={users}
          busy={busyAction === "create-appointment"}
          onChange={handleAppointmentFieldChange}
          onSubmit={createAppointment}
        />
      </div>

      <div className="dashboard-grid">
        <AppointmentsSection
          appointments={appointments}
          busyAction={busyAction}
          onApprove={updateAppointmentStatus}
          onIssuePass={issuePass}
        />
        <PassScannerSection
          passCode={passCode}
          error={passError}
          verifiedPass={verifiedPass}
          busyAction={busyAction}
          onPassCodeChange={(value) => {
            setPassCode(value);
            setPassError("");
          }}
          onVerify={() => verifyPass()}
          onScanAction={scanPass}
          onExportLogs={exportLogs}
        />
      </div>

      <IssuedPassesSection passes={passes} onSelectPass={(code) => verifyPass(code)} />
    </div>
  );
}
