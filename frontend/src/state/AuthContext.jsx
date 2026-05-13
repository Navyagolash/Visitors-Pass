import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api";

const AuthContext = createContext(null);
const TOKEN_KEY = "vms_token";
const USER_KEY = "vms_user";

export function AuthProvider({ children }) {
  const readStoredUser = () => {
    const storedValue = localStorage.getItem(USER_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  };

  const saveSession = (userData, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    // If a token already exists, I ask the backend for the current user profile.
    // That keeps the page in sync even after a refresh.
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch("/auth/me")
      .then((profile) => setUser(profile))
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    saveSession(data.user, data.token);
  };

  const register = async (payload) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    saveSession(data.user, data.token);
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
