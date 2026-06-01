import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("sams_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── AUTH ───────────────────────────────────────────────
export const loginStudent = (matricNo: string, password: string) =>
  api.post("/students/login", { matricNo, password });

export const loginLecturer = (lecturerId: string, password: string) =>
  api.post("/lecturers/login", { lecturerId, password });

// ─── SESSIONS ───────────────────────────────────────────
export const createSession = (courseId: string, duration: number) =>
  api.post("/sessions/create", { courseId, duration });

export const getActiveSessions = () =>
  api.post("/sessions/active", {});

// ─── ATTENDANCE ─────────────────────────────────────────
export const markAttendance = (sessionId: string, code: string) =>
  api.post("/attendance/mark", { sessionId, code });

export const exportCSV = (sessionId: string) =>
  api.post(`/attendance/export/csv/${sessionId}`, {}, { responseType: "blob" });

export const exportExcel = (sessionId: string) =>
  api.post(`/attendance/export/excel/${sessionId}`, {}, { responseType: "blob" });

export default api;
