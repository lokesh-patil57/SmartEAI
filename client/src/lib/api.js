const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function api(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });
  return res;
}

/** GET current user profile (includes resumeText) */
export async function getProfile() {
  const res = await api("/api/auth/me");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load profile");
  return data.user;
}

/** PUT update profile resume text */
export async function updateProfileResume(resumeText) {
  const res = await api("/api/auth/profile/resume", {
    method: "PUT",
    body: JSON.stringify({ resumeText }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save resume");
  return data.user;
}

/** PUT update profile (name) */
export async function updateProfile(updates) {
  const res = await api("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update profile");
  return data.user;
}

/** POST parse resume file (PDF, DOCX, TXT) → { text } */
export async function parseResumeFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/parse/resume`, {
    method: "POST",
    headers,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to parse file");
  return data.text;
}

export { API_BASE };
