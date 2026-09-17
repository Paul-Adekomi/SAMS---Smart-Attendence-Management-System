import express from "express";
import { exportCSV, exportExcel, markAttendance, getStudentAttendance } from "../controllers/attendance.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = express.Router();

router.post('/mark', protect, authorize("student"), markAttendance);
router.get('/my-history', protect, authorize("student"), getStudentAttendance);
router.get('/export/csv/:sessionId', protect, authorize("admin"), exportCSV);
router.get('/export/excel/:sessionId', protect, authorize("admin"), exportExcel);

export default router;
