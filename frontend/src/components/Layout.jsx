import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const navLinks = [
  { to: "/", label: "Dashboard" }
];

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Visitor Pass Manager</p>
          <h1>Frontdesk Control</h1>
          <p className="muted">
            Manage registrations, approvals, QR passes, and visitor movement from one place.
          </p>
        </div>

        <nav className="nav">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="profile-card">
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.role}</p>
          </div>
          <button className="ghost-button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
