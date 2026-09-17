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

// ─── AUTH ────────────────────────────────────────────────
export const loginStudent = (matricNo: string, password: string) =>
  API.post("/students/login", { matricNo, password });

export const loginAdmin = (adminId: string, password: string) =>
  API.post("/admin/login", { adminId, password });

export const registerStudent = (data: {
  token: string;
  fullName: string;
  email: string;
  matricNo: string;
  password: string;
}) => API.post("/students/register", data);

// ─── PUBLIC (no auth) ───────────────────────────────────
export const validateRegistrationLink = (token: string) =>
  API.get(`/public/registration-links/${token}`);

// ─── ADMIN: DEPARTMENTS & COURSES ───────────────────────
export const getDepartments = () => API.get("/admin/departments");
export const getCoursesByDepartment = (departmentId: string) =>
  API.get(`/admin/departments/${departmentId}/courses`);
export const getAllCourses = () => API.get("/admin/courses");
export const createCourse = (data: {
  courseTitle: string;
  courseCode: string;
  departmentId: string;
  creditUnit: number;
  semester: "first" | "second";
  level: string;
}) => API.post("/admin/courses", data);

// ─── ADMIN: STUDENTS ─────────────────────────────────────
export const getAllStudents = () => API.get("/admin/students");
export const createStudent = (data: {
  fullName: string;
  email: string;
  matricNo: string;
  password: string;
  departmentId: string;
}) => API.post("/admin/students", data);
export const updateStudent = (
  id: string,
  data: Partial<{
    fullName: string;
    email: string;
    matricNo: string;
    departmentId: string;
    isActive: boolean;
    password: string;
  }>
) => API.patch(`/admin/students/${id}`, data);
export const deleteStudent = (id: string) => API.delete(`/admin/students/${id}`);

export const getStudentAttendanceHistory = (studentId: string) =>
  API.get(`/admin/students/${studentId}/attendance`);

// ─── ADMIN: REPORTS ──────────────────────────────────────
export const getWeeklyReport = (
  from: string,
  to: string,
  departmentId: string,
  courseId?: string
) =>
  API.get(
    `/admin/reports/weekly?from=${from}&to=${to}&departmentId=${departmentId}${
      courseId ? `&courseId=${courseId}` : ""
    }`
  );

// ─── ADMIN: ATTENDANCE SESSIONS ─────────────────────────
export const createSession = (courseId: string, duration: number) =>
  API.post("/admin/sessions", { courseId, duration });
export const getAllSessions = (courseId?: string) =>
  API.get(`/admin/sessions${courseId ? `?courseId=${courseId}` : ""}`);
export const getActiveSessions = () => API.get("/admin/sessions/active");
export const getSessionReport = (sessionId: string) =>
  API.get(`/admin/sessions/${sessionId}/report`);
export const getSessionRoster = (sessionId: string) =>
  API.get(`/admin/sessions/${sessionId}/roster`);
export const setAttendanceStatus = (
  sessionId: string,
  studentId: string,
  status: "present" | "absent"
) => API.put(`/admin/sessions/${sessionId}/attendance/${studentId}`, { status });

export const exportCSV = (sessionId: string) =>
  API.get(`/attendance/export/csv/${sessionId}`, { responseType: "blob" });
export const exportExcel = (sessionId: string) =>
  API.get(`/attendance/export/excel/${sessionId}`, { responseType: "blob" });

// ─── ADMIN: REGISTRATION LINKS ───────────────────────────
export const generateRegistrationLink = (departmentId: string, expiresInHours: number) =>
  API.post("/admin/registration-links", { departmentId, expiresInHours });
export const listRegistrationLinks = () => API.get("/admin/registration-links");
export const revokeRegistrationLink = (id: string) =>
  API.patch(`/admin/registration-links/${id}/revoke`);

// ─── STUDENT: ATTENDANCE ─────────────────────────────────
export const getSessionByCode = (code: string) => API.post("/sessions/by-code", { code });
export const markAttendance = (sessionId: string, code: string) =>
  API.post("/attendance/mark", { sessionId, code });
export const getMyAttendance = () => API.get("/attendance/my-history");

export default API;
