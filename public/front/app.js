// public/front/app.js
const API = "http://127.0.0.1:8000/api";

export function saveToken(token) {
  localStorage.setItem("token", token);
}
export function getToken() {
  return localStorage.getItem("token");
}
export function clearToken() {
  localStorage.removeItem("token");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Error ${res.status}`);
  }
  return data;
}

export async function login(email, password) {
  const data = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // tu backend devuelve { user: ..., token: "..." }
  if (data.token) saveToken(data.token);
  return data;
}

export async function register(name, email, password) {
  const data = await apiFetch("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  if (data.token) saveToken(data.token);
  return data;
}

export async function logout() {
  await apiFetch("/logout", { method: "POST" });
  clearToken();
}