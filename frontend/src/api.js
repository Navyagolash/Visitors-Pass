const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const REQUEST_TIMEOUT_MS = 15000;

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("vms_token");
  const headers = { ...(options.headers || {}) };
  const isFormData = options.body instanceof FormData;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request took too long. Please try again.");
    }
    throw new Error("Could not reach the server. Please check the backend.");
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Request failed");
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/csv")) {
    return response.text();
  }

  return response.json();
}

export { API_URL };
