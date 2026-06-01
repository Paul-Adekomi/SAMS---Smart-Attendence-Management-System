import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("sams_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong!";
    return Promise.reject(new Error(message));
  }
);

// Auth helpers
export const loginStudent = (matricNo: string, password: string) =>
  API.post("/students/login", { matricNo, password });

export const loginLecturer = (lecturerId: string, password: string) =>
  API.post("/lecturers/login", { lecturerId, password });

// Lecturer
export const getMyCourses = () => API.get("/sessions/my-courses");
export const createSession = (courseId: string, duration: number) =>
  API.post("/sessions/create", { courseId, duration });
export const getActiveSessions = () => API.post("/sessions/active", {});
export const exportCSV = (sessionId: string) =>
  API.post(`/attendance/export/csv/${sessionId}`, {}, { responseType: "blob" });
export const exportExcel = (sessionId: string) =>
  API.post(`/attendance/export/excel/${sessionId}`, {}, { responseType: "blob" });

// Lecturer Reports (new feature)
export const getLecturerReports = () => API.get("/sessions/reports");
export const getSessionReport = (sessionId: string) => API.get(`/sessions/reports/${sessionId}`);

// Student
export const markAttendance = (sessionId: string, code: string) =>
  API.post("/attendance/mark", { sessionId, code });
export const getMyAttendance = () => API.get("/attendance/my-history");

export default API;
