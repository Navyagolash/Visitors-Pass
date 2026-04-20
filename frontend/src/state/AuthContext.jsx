import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("vms_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("vms_token")));

  useEffect(() => {
    const token = localStorage.getItem("vms_token");
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch("/auth/me")
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.removeItem("vms_token");
        localStorage.removeItem("vms_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    localStorage.setItem("vms_token", data.token);
    localStorage.setItem("vms_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (payload) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    localStorage.setItem("vms_token", data.token);
    localStorage.setItem("vms_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("vms_token");
    localStorage.removeItem("vms_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
