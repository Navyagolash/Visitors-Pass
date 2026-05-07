import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getActiveRequestCount, subscribeToApiLoading } from "./api";
import { useAuth } from "./state/AuthContext";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-screen">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [activeRequests, setActiveRequests] = useState(getActiveRequestCount());

  useEffect(() => subscribeToApiLoading(setActiveRequests), []);

  return (
    <>
      {activeRequests > 0 ? (
        <div className="api-loader-overlay">
          <div className="api-loader-card">
            <div className="api-loader-spinner" />
            <strong>Loading...</strong>
            <p>Please wait while we process your request.</p>
          </div>
        </div>
      ) : null}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </>
  );
}
