import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "admin@acme.com", password: "Password123!" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Assignment Demo</p>
        <h1>Sign in to Visitor Pass Manager</h1>
        <p className="muted">Use seeded credentials like `admin@acme.com / Password123!`.</p>
        <label>
          Email
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </label>
        {error ? <div className="error-box">{error}</div> : null}
        <button className="primary-button" type="submit">
          Login
        </button>
        <p className="muted">
          New organization? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
