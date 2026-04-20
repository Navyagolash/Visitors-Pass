import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    organizationId: "acme-hq",
    department: "",
    phone: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Multi-Organization Ready</p>
        <h1>Create the first admin</h1>
        <div className="grid two">
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Organization ID
            <input
              value={form.organizationId}
              onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
            />
          </label>
        </div>
        <div className="grid two">
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
        </div>
        <div className="grid two">
          <label>
            Department
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
        </div>
        {error ? <div className="error-box">{error}</div> : null}
        <button className="primary-button" type="submit">
          Register
        </button>
        <p className="muted">
          Already have access? <Link to="/login">Go back to login</Link>
        </p>
      </form>
    </div>
  );
}
