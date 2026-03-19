const rawApiBase = import.meta.env.VITE_API_BASE;
const API_BASE = rawApiBase
  ? rawApiBase.replace(/\/$/, "")
  : (import.meta.env.DEV ? "http://localhost:5001" : "");

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

// ─── Application Tracking API ──────────────────────────────────────────────────

export async function getApplications(page = 1, limit = 12) {
  const res = await api(`/api/application/user?page=${page}&limit=${limit}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch applications");
  return data;
}

export async function getApplicationById(id) {
  const res = await api(`/api/application/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch application");
  return data.application;
}

export async function updateApplicationStatus(applicationId, status) {
  const res = await api("/api/application/status", {
    method: "PATCH",
    body: JSON.stringify({ applicationId, status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update status");
  return data.application;
}

export async function exportApplicationsCsv() {
  const res = await api("/api/application/export/csv");
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to export CSV");
  }
  return res.blob();
}

export async function downloadDocumentAsTxt(documentId, fileName = "SmartEAI_Document.txt") {
  const res = await api(`/api/documents/${documentId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load document");

  const blob = new Blob([data.content || ""], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export { API_BASE };
