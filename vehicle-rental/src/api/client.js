const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function apiRequest(path, options = {}) {
  const headers = {
    ...options.headers,
  };

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams)
  ) {
    headers["Content-Type"] = "application/json";
  }

  const token = sessionStorage.getItem("access_token");

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof result?.detail === "string"
        ? result.detail
        : `Request failed (${response.status})`;

    throw new Error(message);
  }

  return result;
}

export function getVehicles() {
  return apiRequest("/vehicles/");
}

export function getVehicle(id) {
  return apiRequest(`/vehicles/${id}`);
}

export function registerUser(data) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginUser(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: new URLSearchParams({ username: email, password }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export function getCurrentUser() {
  return apiRequest("/auth/me");
}

export function createBooking(data) {
  return apiRequest("/bookings/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyBookings() {
  return apiRequest("/bookings/mine");
}

export function cancelBooking(id) {
  return apiRequest(`/bookings/mine/${id}/cancel`, { method: "PATCH" });
}

export function getAdminDashboard() {
  return apiRequest("/admin/dashboard");
}

export function getAdminVehicles() {
  return apiRequest("/admin/vehicles");
}

export function createVehicle(data) {
  return apiRequest("/vehicles/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateVehicle(id, data) {
  return apiRequest(`/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteVehicle(id) {
  return apiRequest(`/vehicles/${id}`, { method: "DELETE" });
}