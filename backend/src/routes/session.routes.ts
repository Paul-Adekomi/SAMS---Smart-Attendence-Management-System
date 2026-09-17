import express from 'express';
import { getSessionByCode } from '../controllers/session.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Resolves a session PIN to a sessionId — used by a student marking
// attendance manually instead of scanning the QR code.
router.post('/by-code', protect, getSessionByCode);

export default router;
