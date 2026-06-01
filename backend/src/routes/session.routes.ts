import express from 'express';
import { createSession, getActiveSessions, getLecturerCourses, getLecturerReports, getSessionAttendanceReport, getSessionByCode } from '../controllers/session.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/create', protect, createSession);
router.post('/active', protect, getActiveSessions);
router.post('/by-code', protect, getSessionByCode);
router.get('/my-courses', protect, getLecturerCourses);
router.get('/reports', protect, getLecturerReports);
router.get('/reports/:sessionId', protect, getSessionAttendanceReport);

export default router;
