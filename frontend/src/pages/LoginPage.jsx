import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastMessage } from "../components/ToastMessage";
import { useAuth } from "../state/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "admin@acme.com", password: "Password123!" });
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
      await login(form);
      navigate("/", {
        state: {
          flash: {
            type: "success",
            title: "Login successful",
            text: "Welcome back to Visitor Pass Manager."
          }
        }
      });
    } catch (err) {
      setError(err.message);
      setToast({ type: "error", title: "Login failed", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Assignment Demo</p>
        <h1>Sign in to Visitor Pass Manager</h1>
        <p className="muted">Use seeded credentials like `admin@acme.com / Password123!`.</p>
        <label>
          Email
          <input
            value={form.email}
            disabled={submitting}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            disabled={submitting}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </label>
        {error ? <div className="error-box">{error}</div> : null}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
        <p className="muted">
          New organization? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
