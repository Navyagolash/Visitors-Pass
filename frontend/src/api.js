const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let activeRequests = 0;
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener(activeRequests));
};

const startRequest = () => {
  activeRequests += 1;
  notifyListeners();
};

const finishRequest = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  notifyListeners();
};

export function subscribeToApiLoading(listener) {
  listeners.add(listener);
  listener(activeRequests);

  return () => {
    listeners.delete(listener);
  };
}

export function getActiveRequestCount() {
  return activeRequests;
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("vms_token");
  startRequest();

  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Request failed");
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/csv")) {
      return response.text();
    }

    return response.json();
  } finally {
    finishRequest();
  }
}

export { API_URL };
