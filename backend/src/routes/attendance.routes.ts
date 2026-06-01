import express from "express";
import { exportCSV, exportExcel, markAttendance, getStudentAttendance } from "../controllers/attendance.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post('/mark', protect, markAttendance);
router.get('/my-history', protect, getStudentAttendance);
router.post('/export/csv/:sessionId', protect, exportCSV);
router.post('/export/excel/:sessionId', protect, exportExcel);

export default router;
