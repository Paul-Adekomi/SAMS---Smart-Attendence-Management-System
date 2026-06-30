import { Router } from "express";
import { loginAdmin } from "../controllers/admin.auth.controller";
import {
  getDepartments,
  getCoursesByDepartment,
  getAllStudents,
  createStudent,
  deleteStudent,
  getWeeklyReport,
} from "../controllers/admin.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post("/login", loginAdmin);

router.get("/departments", protect, authorize("admin"), getDepartments);
router.get("/departments/:departmentId/courses", protect, authorize("admin"), getCoursesByDepartment);

router.get("/students", protect, authorize("admin"), getAllStudents);
router.post("/students", protect, authorize("admin"), createStudent);
router.delete("/students/:id", protect, authorize("admin"), deleteStudent);

router.get("/reports/weekly", protect, authorize("admin"), getWeeklyReport);

export default router;
