import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastMessage } from "../components/ToastMessage";
import { useAuth } from "../state/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    organizationId: "",
    department: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await register(form);
      navigate("/", {
        state: {
          flash: {
            type: "success",
            title: "Registration successful",
            text: "Your organization workspace is ready."
          }
        }
      });
    } catch (err) {
      setError(err.message);
      setToast({ type: "error", title: "Registration failed", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Multi-Organization Ready</p>
        <h1>Create the first admin</h1>
        <p className="muted">
          Use a new organization ID for a fresh workspace. Example: `navya-office`
        </p>
        <div className="grid two">
          <label>
            Name
            <input disabled={submitting} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Organization ID
            <input
              disabled={submitting}
              placeholder="e.g. navya-office"
              value={form.organizationId}
              onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
            />
          </label>
        </div>
        <div className="grid two">
          <label>
            Email
            <input disabled={submitting} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Phone
            <input disabled={submitting} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
        </div>
        <div className="grid two">
          <label>
            Department
            <input
              disabled={submitting}
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              disabled={submitting}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
        </div>
        {error ? <div className="error-box">{error}</div> : null}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>
        <p className="muted">
          Already have access? <Link to="/login">Go back to login</Link>
        </p>
      </form>
    </div>
  );
}
