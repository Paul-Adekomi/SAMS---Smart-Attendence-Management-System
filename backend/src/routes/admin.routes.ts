import { Router } from "express";
import { loginAdmin } from "../controllers/admin.auth.controller";
import {
  getDepartments,
  getCoursesByDepartment,
  getAllCourses,
  createCourse,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendanceHistory,
  getWeeklyReport,
} from "../controllers/admin.controller";
import {
  createSession,
  getActiveSessions,
  getAllSessions,
  getSessionAttendanceReport,
  getSessionRoster,
  setAttendanceStatus,
} from "../controllers/session.controller";
import {
  generateRegistrationLink,
  listRegistrationLinks,
  revokeRegistrationLink,
} from "../controllers/registrationLink.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post("/login", loginAdmin);

// Everything below requires an authenticated admin
router.use(protect, authorize("admin"));

router.get("/departments", getDepartments);
router.get("/departments/:departmentId/courses", getCoursesByDepartment);
router.get("/courses", getAllCourses);
router.post("/courses", createCourse);

router.get("/students", getAllStudents);
router.post("/students", createStudent);
router.patch("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);
router.get("/students/:studentId/attendance", getStudentAttendanceHistory);

router.get("/reports/weekly", getWeeklyReport);

router.post("/sessions", createSession);
router.get("/sessions", getAllSessions);
router.get("/sessions/active", getActiveSessions);
router.get("/sessions/:sessionId/report", getSessionAttendanceReport);
router.get("/sessions/:sessionId/roster", getSessionRoster);
router.put("/sessions/:sessionId/attendance/:studentId", setAttendanceStatus);

router.post("/registration-links", generateRegistrationLink);
router.get("/registration-links", listRegistrationLinks);
router.patch("/registration-links/:id/revoke", revokeRegistrationLink);

export default router;
